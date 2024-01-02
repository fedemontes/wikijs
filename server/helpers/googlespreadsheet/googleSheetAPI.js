const {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues
} = require('./googleSheetsService.js');


async function getSpreadSheetAPI() {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheet({
      spreadsheetId,
      auth
    })
    return response.data
  } catch(error) {
    console.log(error.message, error.stack);
  }
}

async function getSpreadSheetValuesAPI(spreadsheetId, credentials, sheetNames) {
  try {
    const auth = await getAuthToken(credentials);
    var   i = 0;
    var   res = [];

    const pArray = sheetNames.map(async sheetName => {
    const response = await getSpreadSheetValues({
         spreadsheetId, 
         sheetName, 
         auth
     })
    let resp = Object.values(response.data.values);
    return resp.slice(1);
    });
    result = await Promise.all(pArray);
	  
    i = 0;
    sheetNames.forEach((item) => {
	res[item] = result[i++]
    });
    

    return res
  } catch(error) {
    console.log(error.message, error.stack);
  }
}

module.exports = {
    getSpreadSheetValuesAPI
}


