import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { config } from 'dotenv';
import os from 'os';


config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server);

// Initialize Redis client
const client = new Redis(process.env.REDIS_URL);

// Handle Socket.io connections
io.on('connection', (socket) => {

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Check if a room exists
    socket.on('check-room-exits', async (data, callback) => {
        const exists = await client.exists(`roomId:${data.roomCode}:roomData`);
        const noOfPlayers = await client.hget(`roomId:${data.roomCode}:roomData`, "noOfPlayers");

        if (noOfPlayers >= 8) {
            callback({ roomExits: true, roomFull: true });
            return;
        }
        callback({ roomExits: exists ? true : false, roomFull: false });
    });

    // Create a new room
    socket.on('create-room', async (data, callback) => {
        const roomCode = data.roomCode;

        // Create a Redis pipeline for batch operations
        const redisPipeline = client.pipeline();

        // Store room data in Redis
        redisPipeline.hset(
            `roomId:${roomCode}:roomData`,
            "roomCode", roomCode,
            "emojiSelected", JSON.stringify([]), // Initial empty array for emoji selection
            "gamePhase", "wait",
            "noOfPlayers", 1 // Initial player count
        );

        // Store user data in Redis
        const userData = {
            id: data.id,
            name: data.name,
            toPlay: false,
            isReady: false,
            chits: [],
            isWinner: false,
            index: 1,
        };
        redisPipeline.hset(`roomId:${roomCode}:userData`, data.id, JSON.stringify(userData));

        // Execute Redis commands
        await redisPipeline.exec();



        // Add the user to the room
        socket.join(roomCode);

        callback({ success: true, roomCode });
    });

    // Join an existing room
    socket.on("join-room", async (data, callback) => {


        // Check if the room exists
        const exists = await client.exists(`roomId:${data.roomCode}:roomData`);
        if (!exists) {
            callback({ success: false, msg: "Room does not exist" });
            return;
        }

        // Check if the user already exists in the room
        const userExists = await client.hget(`roomId:${data.roomCode}:userData`, data.id);
        if (userExists) {
            callback({ success: false, msg: "User already exists in the room" });
            return;
        }

        // Retrieve the current player count
        const noOfPlayers = await client.hget(`roomId:${data.roomCode}:roomData`, "noOfPlayers");

        const redisPipeline = client.pipeline();

        // Increment the player count
        redisPipeline.hset(`roomId:${data.roomCode}:roomData`, "noOfPlayers", parseInt(noOfPlayers) + 1);

        // Retrieve existing users in the room
        const usersAlreadyExits = await client.hgetall(`roomId:${data.roomCode}:userData`);
        const usersAlreadyExitsObj = Object.keys(usersAlreadyExits).reduce((acc, key) => {
            acc[key] = JSON.parse(usersAlreadyExits[key]);
            return acc;
        }, {});



        // Add the new user to the room
        const userData = {
            id: data.id,
            name: data.name,
            toPlay: false,
            isReady: false,
            chits: [],
            isWinner: false,
            index: parseInt(noOfPlayers) + 1,
        };
        redisPipeline.hset(`roomId:${data.roomCode}:userData`, data.id, JSON.stringify(userData));

        // Execute Redis commands
        await redisPipeline.exec();



        // Add the user to the room
        socket.join(data.roomCode);

        // Notify other users in the room

        socket.to(data.roomCode).emit("user-joined", {
            id: data.id,
            name: data.name,
            index: parseInt(noOfPlayers) + 1,
        });

        callback({ success: true, msg: "Room joined successfully", usersAlreadyExitsObj, noOfPlayers: parseInt(noOfPlayers) + 1 });
    });

    // Set an emoji for the room
    socket.on("set-emoji", async (data, callback) => {
        try {
            // Check if the room exists
            const exists = await client.exists(`roomId:${data.roomCode}:roomData`);
            if (!exists) {
                callback({ status: "error", message: "Room does not exist" });
                return;
            }

            // Retrieve and update the emoji list
            const emojiSelected = await client.hget(`roomId:${data.roomCode}:roomData`, "emojiSelected");
            const emojiSelectedArray = JSON.parse(emojiSelected || "[]");

            if (emojiSelectedArray.includes(data.emoji)) {
                callback({ status: "error", message: "Emoji already selected" });
                return;
            }

            emojiSelectedArray.push(data.emoji);

            // Update Redis with the new emoji list
            await client.hset(`roomId:${data.roomCode}:roomData`, "emojiSelected", JSON.stringify(emojiSelectedArray));

            callback({ status: "success", message: "Emoji set successfully" });
        } catch (error) {
            console.error("Error setting emoji:", error);
            callback({ status: "error", message: "An error occurred while setting the emoji" });
        }
    });


    socket.on("update-user-ready", async (data) => {



        const user = await client.hget(`roomId:${data.roomCode}:userData`, data.userId);

        if (!user) {
            return;
        }

        const userData = JSON.parse(user);

        userData.isReady = data.isReady;

        await client.hset(`roomId:${data.roomCode}:userData`, data.userId, JSON.stringify(userData));



        socket.to(data.roomCode).emit("user-ready-updated", {
            userId: data.userId,
            isReady: data.isReady,
        });

        // check if all users are ready 
        const noOfPlayers = await client.hget(`roomId:${data.roomCode}:roomData`, "noOfPlayers");

        if (noOfPlayers < 0) {
            return;
        }

        const users = await client.hgetall(`roomId:${data.roomCode}:userData`);


        // loop through users and check if all are ready
        const allReady = Object.keys(users).every((key) => {
            const user = JSON.parse(users[key]);
            return user.isReady === true;
        });
        if (allReady) {

            let emojiPool = [];

            // 1. Create emojiPool where each emoji appears 4 times
            const emojiSelected = await client.hget(`roomId:${data.roomCode}:roomData`, "emojiSelected");
            const emojiSelectedArray = JSON.parse(emojiSelected || "[]");

            emojiSelectedArray.forEach((emoji) => {
                for (let i = 0; i < 4; i++) {
                    emojiPool.push(emoji);
                }
            });

            // 2. Shuffle the entire emojiPool
            emojiPool = emojiPool.sort(() => Math.random() - 0.5);

            // 3. Distribute 4 emojis per player
            let emojiDistribution = {}; // optional: if you wanna send it to frontend

            const rawUsers = await client.hgetall(`roomId:${data.roomCode}:userData`);
            const users = {};

            for (const [userId, userString] of Object.entries(rawUsers)) {
                users[userId] = JSON.parse(userString);
            }

            // Now users[userId] is a real JS object
            for (const userId of Object.keys(users)) {
                const emojisForUser = emojiPool.splice(0, 4);
                users[userId].chits = emojisForUser;
                emojiDistribution[userId] = emojisForUser;



                if (users[userId].index === 1) {
                    users[userId].toPlay = true;
                }
            }



            // Save updated users back to Redis
            await client.hset(
                `roomId:${data.roomCode}:userData`,
                Object.entries(users).flatMap(([userId, userData]) => [userId, JSON.stringify(userData)])
            );



            // Emit start-game event
            setTimeout(() => {
                io.to(data.roomCode).emit("start-game", {
                    gameStart: true,
                });
            }, 1000);

            // Emit emoji-distributed event
            setTimeout(() => {
                console.log(emojiDistribution)
                io.to(data.roomCode).emit("emoji-distributed", {
                    emojiDistribution,
                });
            }, 2000);




        }
    });


    socket.on("card-passed", async (data) => {
        const users = await client.hgetall(`roomId:${data.roomCode}:userData`);
        const usersObj = Object.keys(users).reduce((acc, key) => {
            acc[key] = JSON.parse(users[key]);
            return acc;
        }, {});

        const pipeline = client.pipeline();

        // 🎯 Update current user's chits
        const currentUser = await client.hget(
            `roomId:${data.roomCode}:userData`,
            data.userId
        );
        const currentUserData = JSON.parse(currentUser);

        const indexToRemove = currentUserData.chits.indexOf(data.emoji);
        if (indexToRemove !== -1) {
            currentUserData.chits.splice(indexToRemove, 1);
        }

        pipeline.hset(
            `roomId:${data.roomCode}:userData`,
            data.userId,
            JSON.stringify(currentUserData)
        );

        const noOfPlayers = await client.hget(
            `roomId:${data.roomCode}:roomData`,
            "noOfPlayers"
        );

        let nextUserId;
        if (data.userIndex === parseInt(noOfPlayers)) {
            // Loop to first user
            nextUserId = Object.keys(usersObj).find(
                (key) => usersObj[key].index === 1
            );
        } else {
            // Move to next index
            nextUserId = Object.keys(usersObj).find(
                (key) => usersObj[key].index === data.userIndex + 1
            );
        }

        const nextUser = await client.hget(
            `roomId:${data.roomCode}:userData`,
            nextUserId
        );
        const nextUserData = JSON.parse(nextUser);

        // 🥁 Announce who's playing next
        if (nextUser) {
            io.to(data.roomCode).emit("whos-playing", {
                name: nextUserData.name,
            });
        }

        // 🧠 Give emoji to next user
        nextUserData.chits.push(data.emoji);

        pipeline.hset(
            `roomId:${data.roomCode}:userData`,
            nextUserId,
            JSON.stringify(nextUserData)
        );

        // 🔁 Notify all clients of card movement
        io.to(data.roomCode).emit("card-passed", {
            emoji: data.emoji,
            nextUserId: nextUserId,
            userId: data.userId,
        });

        // 🏆 WINNER CHECK TIME
        const isWinner = (userData) => {
            return (
                userData.chits.length === 4 &&
                userData.chits.every((emoji) => emoji === userData.chits[0])
            );
        };

        let winnerData = null;
        if (isWinner(currentUserData)) {
            winnerData = currentUserData;
        } else if (isWinner(nextUserData)) {
            winnerData = nextUserData;
        }

        if (winnerData) {
            io.to(data.roomCode).emit("set-winner", {
                name: winnerData.name,
                chits: winnerData.chits,
            });

            console.log(
                `🎉 Winner Found: ${winnerData.name} with chits: ${winnerData.chits}`
            );
        }

        pipeline.exec().then(() => {
            console.log("✅ Card passed and data saved successfully");
        });
    });


});

// Define a basic route for testing
app.get('/', (req, res) => {
    res.send('Socket.io server is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all network interfaces
const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
};

const localIp = getLocalIp();

server.listen(PORT, HOST, () => {
    console.log(`Socket.io server listening on ${HOST}:${PORT}`);
    console.log(`Open http://${localIp}:${PORT} to test on your local network`);
});
