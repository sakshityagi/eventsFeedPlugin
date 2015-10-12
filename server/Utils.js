
// Method to add startDate field in event obj in required timestamp format

// In case event is not a full day event, then insert field endDate
module.exports = function (eventObj) {
  for (var key in eventObj) {
    if (eventObj.hasOwnProperty(key)) {
      var startDateComponents = key.split(";");
      if (startDateComponents.length && startDateComponents[0] == "DTSTART") {
        if (startDateComponents[1] == "VALUE=DATE") {
          var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(eventObj[key]);
          eventObj["startDate"] = +new Date(
            comps[1],
            parseInt(comps[2], 10) - 1,
            comps[3]
          );
        } else {
          var compsStart = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(eventObj[key]);
          var endKey = "DTEND";
          if(startDateComponents.length && startDateComponents[1]) {
            endKey += (";" + startDateComponents[1]);
          }
          var compsEnd = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(eventObj[endKey]);
          if (compsStart !== null) {
            if (compsStart[7] == 'Z') { // GMT
              eventObj["startDate"] = +new Date(Date.UTC(
                parseInt(compsStart[1], 10),
                parseInt(compsStart[2], 10) - 1,
                parseInt(compsStart[3], 10),
                parseInt(compsStart[4], 10),
                parseInt(compsStart[5], 10),
                parseInt(compsStart[6], 10)
              ));
              eventObj["endDate"] = +new Date(Date.UTC(
                parseInt(compsEnd[1], 10),
                parseInt(compsEnd[2], 10) - 1,
                parseInt(compsEnd[3], 10),
                parseInt(compsEnd[4], 10),
                parseInt(compsEnd[5], 10),
                parseInt(compsEnd[6], 10)
              ));
            } else {
              eventObj["startDate"] = +new Date(
                parseInt(compsStart[1], 10),
                parseInt(compsStart[2], 10) - 1,
                parseInt(compsStart[3], 10),
                parseInt(compsStart[4], 10),
                parseInt(compsStart[5], 10),
                parseInt(compsStart[6], 10)
              );
              eventObj["endDate"] = +new Date(
                parseInt(compsEnd[1], 10),
                parseInt(compsEnd[2], 10) - 1,
                parseInt(compsEnd[3], 10),
                parseInt(compsEnd[4], 10),
                parseInt(compsEnd[5], 10),
                parseInt(compsEnd[6], 10)
              );
            }
          }
        }
      }
    }
  }
  return eventObj;
};