const express = require("express");
const app = express();
const http = require("http")
const cors = require("cors")
const {Server} = require("socket.io");
const { Socket } = require("socket.io-client");
const connection = require("./DAL/mysqlCon");
const bodyParser = require('body-parser');
const {toNotificaions} = require("./model/estimateDAO")
app.use(cors())
app.use(bodyParser.json());

// routes
const chatRoutes= require("./routes/message");
const roomsRoutes= require("./routes/estimate");
const { toNotify } = require("./model/estimateDAO");

const server = http.createServer(app)
const rooms = {};


const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

connection.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err.message);
      return;
    }
    console.log('Conexión a la base de datos establecida correctamente');
  });

app.use(chatRoutes);
// Agregar una ruta para obtener las salas asociadas a un usuario por su ID
app.use(roomsRoutes);

app.use(chatRoutes);
  // Manejar la ruta 404 (Not Found)
app.use((req, res) => {
  res.status(404).send("Ruta no encontrada");
});

io.on("connection", (socket) => {
  socket.on("join_room", (idUser)=> {
        socket.join(idUser);
        if (!rooms[socket.id]) {
            rooms[socket.id] = [];
          }
          rooms[socket.id].push(idUser); 
      })
      socket.on("view", (userId)=> {
        socket.emit("viewMessages", userId);
  })


    socket.on("send_message", (data)=> {
        socket.to(data.autorId).emit("recive_message", data);
        socket.to(data.receptorId).emit("recive_message", data);
    })

    socket.on("sendEstimateChange", (data)=> {
      toNotificaions(parseInt(data.estimateId), (res)=>{
        if(res.idClient===data.autorId){
          socket.to(res.idFreelancer+"1").emit("recive_cotizacion", data);
          socket.to(res.idFreelancer+"1").emit("newEstimateSended", data);
        }else{
          socket.to(res.idClient+"2").emit("recive_cotizacion", data);
          socket.to(res.idClient+"2").emit("newEstimateSended", data); 
        }
      });
})
    socket.on("newEstimate", (data)=>{
      socket.to(data.autorId).emit("newEstimateSended", data);
      socket.to(data.receptorId).emit("newEstimateSended", data);
    })

    socket.on("disconnect", () => {
        console.log("Usuario desconectado", socket.id)
        let iduser=rooms[socket.id];
        delete rooms[socket.id];
        socket.leave(iduser);
        Object.keys(rooms).forEach((room) => {
            const index = rooms[room].indexOf(socket.id);
            if (index !== -1) {
              rooms[room].splice(index, 1); // Eliminar usuario de la lista al desconectarse
              io.to(room).emit("users_changed", rooms[room].length); // Emitir evento para actualizar usuarios
              console.log(rooms[room].length, "Usuarios restantes")
            }
        });
    })
})

server.listen(3001, ()=>{
    console.log("Server running")
})
