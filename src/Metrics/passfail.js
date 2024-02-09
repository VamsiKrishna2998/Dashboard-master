
require("dotenv").config();
const axios = require("axios");
const AxiosLogger = require("axios-logger");
// const StatsD = require("hot-shots");
const projects = require("../projects.json");
 
// var client = new StatsD({
//   errorHandler: function (error) {
//     console.log("unable to connect: ", error);
//   },
// });
// AxiosLogger.setGlobalConfig({
//   data: false,
//   headers: true,
// });
function getpassfailcount(Baseurl,Testrailuser,APIkey,projectId,suiteId,newRelicAPI,newRelicAPIKey) {
const api = axios.create({
  baseURL: Baseurl,
  auth: {
    username: Testrailuser,
    password: APIkey,
  },
});
api.interceptors.request.use(
  AxiosLogger.requestLogger,
  AxiosLogger.errorLogger
);
api.interceptors.response.use(
  AxiosLogger.responseLogger,
  AxiosLogger.errorLogger
);
const project = projects[process.env.PROJECT];
var passed = 0, failed = 0;
//var duration = project?.duration;
//var date = new Date();
var specificduration = "";
var specificdurationenddate = "";
var arr = new Array();
console.log('projectid',project.suites[0].projectId)
const getPlans = async (projectId) => {
  api
    .get(`get_plans/${projectId}&created_after=` + specificduration + `&created_before=` + specificdurationenddate)
    .then((response) => {
      var filterOnlyPassed = response.data.plans.map((x) => x.passed_count);
      var filterOnlyFailed = response.data.plans.map((x) => x.failed_count);
      if (response.data.plans.length !== 0) {
        passed += filterOnlyPassed.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
        failed += filterOnlyFailed.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
      }
      console.log(`Got it!: test plan passed[${passed}] failed[${failed}]`);
      client.gauge(process.env.METRIC_PREFIX + ".pass", passed);
      client.gauge(process.env.METRIC_PREFIX + ".fail", failed);
    });
};
const getNumbers = (projectId) => {
  return api
    .get(`get_runs/${projectId}&created_after=` + specificduration + `&created_before=` + specificdurationenddate)
    .then((response) => {
      if (response.data.size == 0) {
        console.log(`passed[${passed}] failed[${failed}]`);
        client.gauge(process.env.METRIC_PREFIX + ".pass", passed);
        client.gauge(process.env.METRIC_PREFIX + ".fail", failed);
      } else {
        if (!response.data) {
          throw "response.data missing";
        } else if (!response.data.runs) {
          throw "cases are missing";
        }
        arr.push(response.data.runs.map((x) => x.id).filter((x) => x));
        arr[0].forEach(function (number) {
          runId = number;
          console.log("runId 1: " + runId);
          sendGetRequest();
        });
      }
    })
    .catch((err) => {
      console.log(`oh no!: ${err}`);
      return true;
    });
};
var count = 0;
const sendGetRequest = async () => {
  console.log("runId 2: " + runId);
  try {
    const resp = await api.get(`get_run/` + runId);
    ++count;
    passed += resp.data.passed_count;
    failed += resp.data.failed_count;
    console.log(`Indivudal test run passed[${passed}] failed[${failed}] count`);
    if (count == arr[0].length) {
      console.log(`Got it!: test run passed[${passed}] failed[${failed}]`);
      client.gauge(process.env.METRIC_PREFIX + ".pass", passed);
      client.gauge(process.env.METRIC_PREFIX + ".fail", failed);
      client.close(function (err) {
        if (err) {
          console.log("something went wrong : ", err);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
  data = JSON.stringify([
    {
      eventType: "passfail",
      passed: passed,
      failed: failed,
      product: project.project_name
    },
  ]);
  pushmetrics();
};
const multiProjects = async () => {
    const ids = project.suites.map(project => project.projectId);
    const filtered = project.suites.filter(({ projectId }, index) => !ids.includes(projectId, index + 1));
  
    const promises = [];
  
    for (let i = 0; i <= filtered.length - 1; i++) {
      promises.push(getNumbers(filtered[i].projectId));
      promises.push(getPlans(filtered[i].projectId));
    }
  
    try {
      await Promise.all(promises);
      // After all promises are resolved
      console.log(`All asynchronous operations completed successfully.`);
    } catch (error) {
      // Handle errors if any of the promises are rejected
      console.error(`Error during asynchronous operations: ${error}`);
    }
  };
multiProjects();
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
}

module.exports=getpassfailcount