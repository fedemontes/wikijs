const {
  getAuth,
  getCreateProjects,
} = require('./rcmdAIservice.js');


async function getProjectsAI(url, JWT, args) {
  try {
    var cookies = [];
    let i = 0;

    const auth = await getAuth(url, JWT);
    if ( auth.headers ) {
       if ( auth.headers['set-cookie'] ) {
	    auth.headers['set-cookie'].forEach((element) => {
		cookies[i++] = element.split(';')[0];
	    })
       }
    }

    if ( auth.data.apikeys.code  ) {
	  if (auth.data.apikeys.code = '200' ) {
             const response = await getCreateProjects(url, JWT, cookies.join(';'), args);
             return response;
	  }
    }
  } catch(error) {
	return error;
  }
}

module.exports = {
    getProjectsAI
}
