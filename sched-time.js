  // import moment.js && underscore.js
  var moment = require('moment');
  var _und = require("underscore@1.8.3");

/**
* @param context {WebtaskContext}
*/
module.exports = function(context, cb) {
  
  // set variables for calculations
  var eventDelta = parseInt(context.query.delta);
  var createdAt = parseInt(context.query.startTime);
  var inTime = createdAt + eventDelta;
  var offSet = parseInt(context.query.offSet.substring(0,context.query.offSet.search(":")));
  var win_open = parseInt(context.query.lowerLimit.substring(0, 2)) - offSet;
  var win_close = parseInt(context.query.upperLimit.substring(0, 2)) - offSet; 
  
  // create date object
  var convBase = moment.utc(createdAt)
  var conv = moment.utc(inTime);
  
  var msInOneDay = 86400000;
  var dayDelay = Math.ceil(eventDelta / msInOneDay);
  
  // determine the number of milliseconds to delay based on size of delta value
  function msCalc(ms) {
    if (eventDelta < (msInOneDay*(win_close-win_open)/24)) {
      set_ms = eventDelta;
      return set_ms;
    } else  {
        set_ms = _und.random(60000,900000);
        return set_ms;
    }
  }
  
  // return scheduled time
  function checkTime(hour) {
    if (win_open < hour && hour < win_close) {
      sched_time = conv.add(7, "seconds");
      return sched_time; // schedules as normal if "in bounds"
    } 
    else if (hour < win_open) {
      baseDate = moment().set({'year': conv.year(), 'month': conv.month(), 'date': conv.date(), 'hour': 0, 'minute': 0, 'second': 0});
      sched_time = baseDate.add({days:0, hours:win_open, milliseconds:msCalc(eventDelta)});
      return sched_time; // waits until startTime on given day
    }
    else {
      baseDate = moment().set({'year': convBase.year(), 'month': convBase.month(), 'date': convBase.date(), 'hour': 0, 'minute': 0, 'second': 0});
      sched_time = baseDate.add({days:dayDelay, hours:win_open, milliseconds:msCalc(eventDelta)});
      return sched_time; // waits until the window opens on next day
    }
  }
  
  cb(null, { 
    "scheduleDateTime" : checkTime(conv.hours())  });
};