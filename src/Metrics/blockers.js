
require("dotenv").config();
const axios = require("axios");
const pr = require ("../jiraproject.json");
const project = pr[process.env.PROJECT];
var jql = "project = " + project.project_name + " " + pr['blocklistjql'];
let  blockerslist= 0;
let postdata = {
  eventType: "jirablockers",
  blockers: blockerslist,
  product: project.project_name
};
function getblockerscount(Baseurl,Jirauser,jiraAPIkey,jiraCookie,projectId,suiteId,newRelicAPI,newRelicAPIKey) { 
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
    blockerslist = response.data.total;
    console.log("Blocker tickets -", blockerslist);
    postdata.blockers = blockerslist;
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

module.exports=getblockerscount