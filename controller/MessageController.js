const {getMessages, insterMessage, insertImages, ViewMessages, notifications} = require("../model/messageDAO");

exports.getMessages=(req, res) => {
    const roomId = req.params.roomId;
    getMessages(roomId, (response)=>{
        if(response.error){
            if(response.error===400){
                res.status(404).send('No se encontraron mensajes');
            }else if(response.error===500){  
                res.status(500).send('Error al obtener los mensajes asociados a la sala');
            }
        }else{
            res.json(response);
        }
        
    })
    
  };

  exports.createMessage=(req, res) => {
    // Extraer los datos del cuerpo de la solicitud
    const { content, autor, room_id, time } = req.body;
  
    // Verificar si se recibieron todos los campos necesarios
    if (!content || !autor || !room_id || !time) {
      return res.status(400).json({ error: 'Faltan campos obligatorios en el mensaje' });
    }
    insterMessage(content, autor, room_id, time, (result)=>{
        const {error} =  result;
        if(error){
            res.status(500).json({ error: 'Error al guardar el mensaje en la base de datos' });
        }else{
            res.status(201).json({ message: 'Mensaje guardado correctamente' });
        }
    })
    // Insertar el mensaje en la base de datos
    
  };

  exports.inserImages=(req, res) => {
    // Extraer los datos del cuerpo de la solicitud
    const { attachment, autor, room_id, time, visto } = req.body;
  
    // Verificar si se recibieron todos los campos necesarios
    if (!attachment || !autor || !room_id || !time) {
      return res.status(400).json({ error: 'Faltan campos obligatorios en el mensaje' });
    }
    // Insertar el mensaje en la base de datos
    insertImages(attachment, autor, room_id, time, visto, (result)=>{
        const {error}= result;
        if(error){
            res.status(500).json({ error: 'Error al guardar el mensaje en la base de datos' });
        }else{
            res.status(201).json({ message: 'Mensaje guardado correctamente' });
        }
    })
  };


exports.setView= (req, res)=>{
    let {estimateId, userName} = req.body;
    ViewMessages(estimateId, userName, (response)=>{
        res.json(response);
    });
}

exports.notifications=(req,res)=>{
    notifications(req.body, (response)=>{
        console.log(response)
        res.json(response);
    })
}