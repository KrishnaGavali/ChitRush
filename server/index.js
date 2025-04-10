import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { config } from 'dotenv';


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
    });

});

// Define a basic route for testing
app.get('/', (req, res) => {
    res.send('Socket.io server is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.io server listening on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to test`);
});
