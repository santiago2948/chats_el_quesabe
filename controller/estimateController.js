const EmailSender = require("../DAL/emailSender");
const { fetchAllEstimates , createEstimate, getById, setState, setToken } = require("../model/estimateDAO");
const generarToken= require("../DAL/tokenGenerator");

const emailSender= new EmailSender();

exports.getUserEstimates = (req, res) => {
    const {id, user, name} = req.body;
    // Consulta a la base de datos para obtener las salas asociadas al usuario con el ID proporcionado
    fetchAllEstimates(id , user, name, (result) => {
        const { error } = result;
        if (error === 404) {
            res.status(404).send('No se encontraron salas asociadas al usuario');
            return;
        } else if(error === 500){
            res.status(500).send('Error al obtener las salas asociadas al usuario');
            return;
        } else {
            res.json(result);
            return;
        }
    });
};

exports.creatEstimate = (req, res, next)=>{
    let link=null;
        try {
            if(req.file.path)
            link=req.file.path;
        } catch (error) {
            console.log(error+"\n en el arhivo estimateController");
        }
    req.body["photo"]=link;
    createEstimate(req.body, (response)=>{
        res.json(response);
    })
}

exports.getEstimateById=(req,res)=>{
    getById(req.body, (response)=>{
        res.json(response)
    })
}

exports.setStateStimate=(req, res)=>{
    const {state, id}=req.body;
    if(state===5){
        const token= generarToken();
        setToken(id, token, (response)=>{
            emailSender.sendClientTokenNewService(response.emailCliente, token);
            emailSender.sendFreelancerTokenNewService(response.emailFreelancer, token);
        })
    }
    setState(req.body, (response)=>{
        res.json(response);
    })
}