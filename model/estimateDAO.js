const connection= require("../DAL/mysqlCon");
const fs = require("fs");
const sharp = require("sharp");


exports.fetchAllEstimates = async (userId, user, name, cb) => {
  let sql =
    user === "2"
      ? "select estimateId id, f.name name, e.description, f.profilePhoto, sendedBy user, state_stateId state, f.idFreelancer receptor, e.sendDate lasTime, authenticationCode from estimate e join freelancer f using(idFreelancer) where idClient=? order by sendDate desc"
      : "select estimateId id, c.name name, e.description, c.profilePhoto, sendedBy user, state_stateId state, c.idClient receptor, e.sendDate lasTime, authenticationCode from estimate e join client c using( idClient) where idFreelancer=? order by sendDate desc";
  connection.query(sql, [userId], async (err, results) => {
    if (err) {
      console.error("Error al obtener las salas asociadas al usuario:", err.message);
      cb({ error: 500 });
    } else {
      // Iterar sobre los resultados de manera sincrónica con un bucle for
      for (let i = 0; i < results.length; i++) {
        const estimate = results[i];
        
        await new Promise((resolve, reject) => {
          let sql = "select count(*) msg from messages where estimateId=? and autor!=? and visto=0";
          connection.query(sql, [estimate.id, name], (err, res) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              estimate["msg"] = res[0].msg;
              resolve();
            }
          });
        });
        await new Promise((resolve, reject) => {
          let sql = "SELECT MAX(time) AS lastTime FROM messages where estimateId=?";
          connection.query(sql, [estimate.id], (err, res) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              estimate["lasTime"] = res[0].lastTime===null? estimate["lasTime"]: res[0].lastTime;
              resolve();
            }
          });
        });

        if (estimate.profilePhoto) {
          let photo = estimate.profilePhoto.toString("base64");
          estimate["profilePhoto"] = photo;
        }
      }
      results.sort((a, b) => new Date(b.lasTime) - new Date(a.lasTime));
      cb({ estimate: results });
    }
  });
};

exports.createEstimate= async (json, cb)=>{
  const { city, user, idClient, idFreelancer, place, description, dateStart, photo, img} =json;
  const date = dateStart===""? null: dateStart;
  let sql= "INSERT INTO estimate (`idClient`, `idFreelancer`, `description`, `adress`, `idCity`, `sendedBy`, `state_stateId`, `dateStart`, `dercriptiveImg`) VALUES (?,?,?,?,?,?,?,?,?)";
  let values=[idClient, idFreelancer, description,place,city,user, 1 ,date];
  let fileContent=null;
  if(user===1){
    try{
      if(img)
      fileContent = Buffer.from(img, "base64");
    }catch(err){
      console.log(err)
    }
  }else if(photo){
    fileContent = await sharp(photo)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();
  }
  values.push(fileContent);
  connection.query(sql, values, (err, res) => {
    if (photo !== null) {
      fs.unlink(photo, (error, result) => {
          if (error) {
              console.error("Error deleting file:", error);
          }
      });
    }
    if (err) {
      console.error('Error al crear estimacion', err.message);
      cb({result:false });
    }else{
      cb({result: true, idFreelancer: idFreelancer, idClient: idClient, id: res.insertId});
    }
     
  });
}

exports.getById= async (json, cb)=>{
  const {estimateId, user, name} =json;

  let sql=user==="1"? "select sendDate, estimateId, `idClient`, `idFreelancer`, e.description, e.adress, t.name city, `sendedBy`, `state_stateId` state, `dateStart`, `dercriptiveImg`, c.name clientName, f.name freelancerName, cost, c.profilePhoto profilePhoto, authenticationCode from estimate e join client c using(idClient) join freelancer f using(idFreelancer) join town t on e.idCity=t.idCity where estimateId=?": 
  "select sendDate, estimateId, `idClient`, `idFreelancer`, e.description, e.adress, t.name city, `sendedBy`, `state_stateId` state, `dateStart`, `dercriptiveImg`, c.name clientName, f.name freelancerName, cost, f.profilePhoto profilePhot, authenticationCode from estimate e join client c using(idClient) join freelancer f using(idFreelancer) join town t on e.idCity=t.idCity where estimateId=?";
  connection.query(sql, [parseInt(estimateId)], async (err, results) => {
    if (err) {
      console.error('Error al en getByid', err);
      cb({result: false });
    }else{
    const estimate = results[0];
    if(estimate.profilePhoto){
      let photo=estimate.profilePhoto.toString('base64');
      estimate["profilePhoto"]=photo;
    } 
    if(estimate.dercriptiveImg){
      let photo=estimate.dercriptiveImg.toString('base64');
      estimate["dercriptiveImg"]=photo;
    } 
    let sql = "select count(*) msg from messages where estimateId=? and autor!=? and visto=0";
    await new Promise((resolve) => {
        connection.query(sql, [parseInt(estimateId), name], (err, res)=>{
          estimate["msg"]=res[0].msg;
          resolve();
        }) 
    })
    cb(estimate);
    }
  });

}
exports.setState= async (json, cb)=>{
  const {state, id, cost}= json;
  const values = [
    parseInt(state),
    parseInt(id)
  ];
  
  let sql =state!==7? "update estimate set state_stateId=? where estimateId=?" :
  "update estimate set state_stateId=?, finishdate= NOW() where estimateId=?";
  if(cost) {
    values.splice(1 ,0, parseFloat(cost));
    sql="update estimate set state_stateId=?, cost=? where estimateId=?";
  }
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error en setState', err.message);
      cb({result: false });
    }else{
      cb(results[0]);
    }
  });
}

exports.toNotificaions= (id, cb)=>{
  let sql = "select idClient, idFreelancer from estimate where estimateId=?";
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error en toNotifications', err.message);
    }else{
      cb(results[0]);
    }
  });
}

exports.setToken= async (estimateId, token, cb)=>{
  let sql= "select c.email emailCliente, f.email emailFreelancer from estimate join freelancer f using(idFreelancer) join client c using(idClient) where estimateId =?"
  connection.query(sql, [estimateId], (err, results) => {
    if (err) {
      console.error('Error en setToken', err.message);
    }else{
      sql= "UPDATE `el_que_sabe`.`estimate` SET `authenticationCode` = ?, dateStart= NOW() WHERE (`estimateId` = ?)"
      connection.query(sql, [token, estimateId], (err) => {
        if(err) console.log(err);
      });
      cb(results[0]);
    }
  });
}