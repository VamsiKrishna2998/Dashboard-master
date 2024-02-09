require("dotenv").config();

const axios = require("axios");
let data;

//const Axioslogger = require ('axios-logger');

const projects = require("../projects.json");

function getautomationmanualcount(Baseurl,Testrailuser,APIkey,projectId,suiteId,newRelicAPI,newRelicAPIKey) {
const api = axios.create({
  baseURL: Baseurl,

  auth: {
    username: Testrailuser,

    password: APIkey,
  },
});

const project = projects[process.env.PROJECT];

console.log("ss", project);

//const limit = 250;

//var offset = 0;

//var done = false;

var automated = 0,
  manual = 0;

const getNumbers = () => {
  return api
    .get(
      `get_cases/${projectId}&suite_id=${suiteId}&limit=250&offset=0`
    )

    .then((response) => {
      if (!response.data) {
        throw "response.data missing";
      } else if (!response.data.cases) {
        throw "cases are missing";
      }

      if (project == process.env.PROJECT) {
        automated += response.data.cases
          .map(x => x.custom_automation_type)
          .filter(x => [2,5].includes(x)).length;

        manual += response.data.cases
        .map(x => x.custom_automation_type)
        .filter(x => [0,1,3,4,6].includes(x)).length;

      } 

      console.log(`update: automated[${automated}]not[${manual}]`);
      data = JSON.stringify([
        {
          eventType: "automatedmanual",
          automated: automated,
          manual: manual,
          product: project.project_name
        },
      ]);
      pushmetrics();
    });

};

const pushmetrics =  () => {
  let config = {
    method: "post",
    url: newRelicAPI,
    headers: {
      "Api-Key": newRelicAPIKey,
      "Content-Type": "application/json",
    },

    data: data,
  };
  axios(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

getNumbers();
}

module.exports=getautomationmanualcount