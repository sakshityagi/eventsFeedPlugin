module.exports = function (eventObj) {
  for (var key in eventObj) {
    if (eventObj.hasOwnProperty(key)) {
      var startDateComponenets = key.split(";");
      if (startDateComponenets.length && startDateComponenets[0] == "DTSTART") {
        if (startDateComponenets[1] == "VALUE=DATE") {
          var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(eventObj[key]);
          eventObj["startDate"] = +new Date(
            comps[1],
            parseInt(comps[2], 10) - 1,
            comps[3]
          );
        } else {
          var comps = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(eventObj[key]);
          if (comps !== null) {
            if (comps[7] == 'Z') { // GMT
              eventObj["startDate"] = +new Date(Date.UTC(
                parseInt(comps[1], 10),
                parseInt(comps[2], 10) - 1,
                parseInt(comps[3], 10),
                parseInt(comps[4], 10),
                parseInt(comps[5], 10),
                parseInt(comps[6], 10)
              ));
            } else {
              eventObj["startDate"] = +new Date(
                parseInt(comps[1], 10),
                parseInt(comps[2], 10) - 1,
                parseInt(comps[3], 10),
                parseInt(comps[4], 10),
                parseInt(comps[5], 10),
                parseInt(comps[6], 10)
              );
            }
          }
        }
      }
    }
  }
  return eventObj;
};