// used at webtask.io
// import moment.js && underscore.js
  var moment = require('moment-timezone');
  var _und = require("underscore@1.8.3");

/**
* @param context {WebtaskContext}
*/
module.exports = function(context, cb) {
  
  // set the base time of when the prospect is created -- schedule today or tomorrow?
  var maxDelay = parseInt(context.query.dayMaxDelay);
  var createdAt = parseInt(context.query.startTime); // prospect creation date
  var inTime = createdAt + maxDelay;
  
  var eventDelta = parseInt(context.query.delta);
  var imm = createdAt + eventDelta;
  
  var now = moment();
  
  var win_open = parseInt(context.query.lowerLimit.substring(0, 2));
  var win_close = parseInt(context.query.upperLimit.substring(0, 2)); 
  var timeZone = context.query.timezoneID;
  var elemType = context.query.elemType;
  
  var addDay = parseInt(context.query.dayOffset);
  var addHour = parseInt(context.query.hourToSend);
  var addMin = parseInt(context.query.minToSend);
  
  var sendWeekends = parseInt(context.query.sendWeekends);
  
  var inTimeMoment = moment(inTime);
  var inDOW = inTimeMoment.isoWeekday();
  
  var winOpenMoment = moment.tz([inTimeMoment.year(), inTimeMoment.month(), inTimeMoment.date(), win_open], timeZone);
  var winCloseMoment = moment.tz([inTimeMoment.year(), inTimeMoment.month(), inTimeMoment.date(), win_close], timeZone);
  
  console.log(moment.utc(imm).format('x'));
  function schedule(type) {
    
    if (elemType === 'immediate') { // schedule immediate events
    
      if (winOpenMoment.format('x') < inTimeMoment.format('x') && inTimeMoment.format('x') < winCloseMoment.format('x')) {
        sched_time = moment.utc(imm).add({seconds:7});
        return sched_time; // send now
      }
      
      else if (winOpenMoment.format('x') > inTimeMoment.format('x')) {
        sched_time = winOpenMoment.add({milliseconds:eventDelta});
        return sched_time; // wait until the open window
      }
      
      else {
        sched_time = winOpenMoment.add({days:1, milliseconds:eventDelta});
        return sched_time; // wait until tomorrow
      }
    }
    
    else { // event type delay
      sched_time = moment.tz([inTimeMoment.year(), inTimeMoment.month(), inTimeMoment.date(), addHour, addMin], timeZone).add({days:addDay});
      return sched_time;
    }
  }
  
  // handle weekend
  function acctWeekend() {
    if (sendWeekends === 1) {
      return 0;
    }
    else {
      if (inDOW !== 6 && inDOW !== 7) {
        return 0;
      }
      else if (inDOW === 6) {
        return 2;
      }
      else {
        return 1;
      }
    }
  }
  
  cb(null, { 
    "scheduleDateTime" : schedule(elemType).add({days:acctWeekend()}).format('x')  });
};
