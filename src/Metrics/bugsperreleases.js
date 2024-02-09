
require("dotenv").config();
const axios = require("axios");
//const fs = require("fs");
const pr = require ("../jiraproject.json");
const project = pr[process.env.PROJECT];
//const jqlFile = fs.readFileSync("project.json");
//const bugsperreleasejql = JSON.parse(jqlFile).bugsperreleasejql;
var jql = "project = " + project.project_name + " " + pr['bugsperreleasejql'];
let bugsperrelease = 0;
let postdata = {
  eventType: "jirabugrelease",
  bugsreleases: bugsperrelease,
  product: project.project_name
};
function getbugsperreleasecount(Baseurl,Jirauser,jiraAPIkey,jiraCookie,projectId,suiteId,newRelicAPI,newRelicAPIKey) { 
let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: Baseurl + "/search?jql=" + encodeURIComponent(jql),
  headers: {
    Authorization: `Basic ${jiraAPIkey}`,
    Cookie: jiraAPIkey,
  },
};
 
axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data.total));
    bugsperrelease = response.data.total;
    console.log("Bugs per release", bugsperrelease);
    postdata.bugsreleases = bugsperrelease;
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

module.exports=getbugsperreleasecount

