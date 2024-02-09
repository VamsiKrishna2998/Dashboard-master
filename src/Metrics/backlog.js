
require("dotenv").config();
const axios = require("axios");
//const fs = require("fs");
const pr = require ("../jiraproject.json");
const project = pr[process.env.PROJECT];
//const jqlFile = fs.readFileSync("project.json");
//const backlogjql= JSON.parse(jqlFile).backlogjql;
var jql = "project = " + project.project_name + " " + pr['backlogjql'];
let  backlogtickets= 0;
let postdata = {
  eventType: "jirabacklogtickets",
  backlogtickets: backlogtickets,
  product: project.project_name
};
function getbacklogticketcount(Baseurl,Jirauser,jiraAPIkey,jiraCookie,projectId,suiteId,newRelicAPI,newRelicAPIKey) {
let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: Baseurl + "/search?jql=" + encodeURIComponent(jql),
  headers: {
    Authorization: `Basic ${jiraAPIkey}`,
    Cookie: jiraCookie,
  },
};
 
axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data.total));
    backlogtickets = response.data.total;
    console.log("Backlog tickets count -", backlogtickets);
    postdata.backlogtickets = backlogtickets;
    console.log("data assigned", postdata);
    pushmetrics();
  })
  .catch((error) => {
    console.error("Error in JIRA API request:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  });
 
const pushmetrics = async () => {
  let metricsConfig = {
    method: "post",
    url: newRelicAPI,
    headers: {
      "Api-Key": newRelicAPIKey,
      "Content-Type": "application/json",
    },
    data: postdata,
  };
 
  axios(metricsConfig)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.error("Error in New Relic API request:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    });
};
} 

module.exports=getbacklogticketcount