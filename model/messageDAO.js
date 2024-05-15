const connection= require("../DAL/mysqlCon");

exports.getMessages = async (roomId, cb) =>{
    connection.query('SELECT id, content, autor, estimateid, attachment, DATE_FORMAT(time, "%H:%i") AS time FROM messages WHERE estimateid = ?', [roomId], (err, results) => {
      if (err) {
        console.error('Error al obtener los mensajes asociadas a la sala: ', err.message);
        cb({error: 500});
        return;
      }
      if (results.length === 0) {
        cb({messages: []})
        return;
      }
      cb({ messages : results });
      
    })
    }

exports.insterMessage= async (content, autor, estimateid, time, cb)=>{
     connection.query('INSERT INTO messages (content, autor, estimateid, visto) VALUES (?, ?, ?,?)', [content, autor, estimateid, 0], (err, result) => {
        if (err) {
          console.error('Error al guardar el mensaje:', err);
          cb({error: 500})
        }else{ 
            console.log('Mensaje guardado correctamente en la base de datos');
        }
      });
}

exports.insertImages= async (attachment, autor, estimateid, time, cb)=>{
    connection.query('INSERT INTO messages (attachment, autor, estimateid, time) VALUES (?, ?, ?, ?)', [attachment, autor, estimateid, time], (err, result) => {
        if (err) {
          console.error('Error al guardar el mensaje:', err); 
        }
        console.log('Mensaje guardado correctamente en la base de datos');
      });
}

exports.ViewMessages=(estimateId, userName, cb)=>{
  let sql="update messages set visto=1 where estimateId=? and autor!=?";
  connection.query(sql, [estimateId, userName],(err, res)=>{
    if(err){
      console.log(err);
      cb({response:false})
    }else{
      cb({response: true});
    }
  })
}

exports.notifications= (json, cb)=>{
  const {user, idUser, name} = json;
  let sql=user==="1"? "select count(*) notificatios from (select state_stateId state, visto, sendedBy from estimate left join messages using(estimateId) where idFreelancer=? and autor!=? and state_stateId<5) notificaion where state = 1 or state = 3 or visto=0":
  "select count(*) notificatios from (select state_stateId state, visto, sendedBy from estimate left join messages using(estimateId) where idClient=? and autor!=? and state_stateId<5) notificaion where state = 1 or state = 3 or visto=0"
  connection.query(sql, [idUser, name], async (err, res)=>{
    if(err){
      console.log(err);
      cb({response: false, notifications: 0});
    }else{
      let cuenta=res[0].notificatios;
      let sql =user==="2"? "select count(*) cuenta from estimate where state_stateId=1 or state_stateId = 3 and idClient=? and sendedBy!=?":
      "select count(*) cuenta from estimate where state_stateId=1 or state_stateId = 1 and idFreelancer=? and sendedBy!=?";
      let contractsNotifications = 0;
      await new Promise((resolve) => {
        connection.query(sql, [idUser,parseInt(user)], (err, res)=>{
          cuenta+= res[0].cuenta;
          resolve();
        }
      )
    })
    await new Promise((resolve) => {
      sql=user==="1"? "select count(*) cuenta from (select state_stateId state, visto, sendedBy from estimate left join messages using(estimateId) where idFreelancer=? and autor!=? and state_stateId>=5) notificaion where visto=0":
      "select count(*) cuenta from (select state_stateId state, visto, sendedBy from estimate left join messages using(estimateId) where idClient=? and autor!=? and state_stateId>=5) notificaion where visto=0"    
      connection.query(sql, [idUser, name], (err, response)=>{
        contractsNotifications+= response[0].cuenta;
        resolve();
      }
    )
  })
      cb({response:true, notifications: cuenta, contractsNotifications: contractsNotifications})
    }
  })
}