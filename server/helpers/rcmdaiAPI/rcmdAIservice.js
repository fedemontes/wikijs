const axios = require('axios');

async function getAuth(url, JWT) {

let axiosConfig = {
  headers: {
      'Authorization': `Bearer ${JWT}` 
  }
};

try {
const response = await axios.get(url + "/auth/login",axiosConfig)
   return response;
} catch (err) {
   return err;
}

}

async function getCreateProjects(url, JWT, cookies, args) {
let axiosConfig = {
  headers: {
      'Authorization': `Bearer ${JWT}`,
      'Cookie' : cookies
  }
};

let postData = {
     sector: args.sector.toString(),
     empleados: args.empleados.toString(),
     tecnologias: args.tecnologias.toString(),
     sostenibilidad: args.sostenibilidad.toString(),
     perfil_alumnado: args.perfil_alumnado.toString(),
     perfil_ideal: args.perfil_ideal.toString(),
     experiencia: args.experiencia.toString(),
     publico_objetivo: args.publico_objetivo.toString(),
     proyecto_objetivo: args.proyecto_objetivo.toString(),
     extra: args.extra.toString(),
     doblin: args.doblin.toString()
 
}

try {
const response = await axios.post(url + "/projects", postData, axiosConfig)
   return response.data;
} catch (err) {
   return err;
}

}

module.exports = {
  getAuth,
  getCreateProjects
}
