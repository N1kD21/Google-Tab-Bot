// Copyright 2017 Viber Media S.à r.l. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Constants
var RASPISANIE_SHEET_NAME = 'raspisanie';
var PARAMETERS_SHEET_NAME = 'parameters';
var TOKENS_SHEET_NAME = 'tokens';
var QUESTIONS_SHEET_NAME = 'questions';
var ANSWERS_SHEET_NAME = 'answers';
var SURVEY_STARTED_STATE_TYPE = 'started';
var SURVEY_ENDED_STATE_TYPE = 'ended';
var IN_SURVEY_STATE_TYPE = 'survey';

// Global parameters (Values will be read from the parameters sheet)
var gDidFillParameters = false;
var gAccessToken = 'Your access token value from the parameters sheet';
var gBotName = 'Your bot name from the parameters sheet';
var gBotAvatar = 'Your bot avatar url from the parameters sheet';
var gWelcomeMessage = 'Добро пожаловать. Этот бот предоставляет расписание на выбранный день.';
var gWelcomeStartButton = 'Your welcome start button from the parameters sheet';
var gEndMessage = 'Your end message from the parameters sheet';
var gDoNotUnderstandMessage = 'Your do not understand input message from the parameters sheet';
var gShouldUseRandomColors = false;
var gDefaultKeyboardColor = 'Your default keyboard option color from the parameters sheet';
var gMessageDefault = 'Этот бот предоставляет расписание при выборе дня недели на клавиатуре или при введении слов Понедельник, Вторник, Среда, Четверг, Пятница'
var MondayRaspisanie = 'Понедельник';
var TuesdayRaspisanie = 'Вторник';
var WednesdayRaspisanie = 'Среда';
var ThersdayRaspisanie = 'Четверг';
var FridayRaspisanie = 'Пятница';
var MondayNazwa;
var TuesdayNazwa;
var WednesdayNazwa;
var ThersdayNazwa;
var FridayNazwa;
var ZvonkiRaspisanie;
var ZvonkiNazwa;
var accesTokenBotTelegramProfileGetUserDetails;
var accesTokenBotTelegramMessageUser;
var ChatIdProfileGetUserDetails;
var ChatIdMessageUser;
var keyboardAssay = [MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]
// ---- Input validation methods ----


// Функция связаная с календарем
function listNext10Events( ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject) {
  sayText('57. Test', ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject);
  var calendarId = 'sd3c4kcg1aj08rhst645i1pvh4@group.calendar.google.com';
  var now = new Date();
  var events = Calendar.Events.list(calendarId, {
    timeMin: now.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 10
  });
  if (events.items && events.items.length > 0) {
    for (var i = 0; i < events.items.length; i++) {
      var event = events.items[i];
      if (event.start.date) {
        // All-day event.
        var start = new Date(event.start.date);
//        Logger.log('%s (%s)', event.summary, start.toLocaleDateString());
        sayText('73. ' + event.summary, ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject);
        sayText('74. ' + start.toLocaleString(), ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject);
      } else {
        var start = new Date(event.start.dateTime);
        sayText('77. ' + event.summary, ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject);
        sayText('78. ' + start.toLocaleString(), ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject);
        sayText('79. ' + event, ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject);


//        Logger.log('%s (%s)', event.summary, start.toLocaleString());
      }
    }
  } else {
//    Logger.log('No events found.');
//      sayText('No events found.', ResultgetSenderId, ResultgAccessToken, ResultgBotName, ResultgBotAvatar, ResultstateInSurvey, ResultkeyboardObject);

  }
  var result22 =  UrlFetchApp.fetch('https://api.telegram.org/bot' + accesTokenBotTelegramMessageUser + '/sendMessage?chat_id=@' + ChatIdMessageUser + '&text= ' + now);

  return now;
}



function isEvent(postData, event) {
  return (postData.event == event);
}

function isMessageEvent(postData) {
  return isEvent(postData, 'message');
}

function isMessageType(postData, type) {
  if (!isMessageEvent(postData)) return false;
  if (!postData.message ||  postData.message.type !== type) return false;

  return true;
}

function isConversationStartEvent(postData) {
  return isEvent(postData, 'conversation_started');
}

function isTextMessage(postData) {
  return isMessageType(postData, 'text');
}

function extractTextFromMessage(postData) {
  if (!postData || !postData.message) return undefined;

  return postData.message.text;
}

// ---- Tracking data state methods ----

function isEmptyState(postData) {
  if (!postData.message || !postData.message.tracking_data) return true;
  return (JSON.stringify(postData.message.tracking_data) === JSON.stringify({}));
}

function stateSurveyStarted() {
  var state = {
    type: SURVEY_STARTED_STATE_TYPE
  }
  return (state);
}

function isStateStartedSurvey(trackingData) {
    return (trackingData.type === SURVEY_STARTED_STATE_TYPE);
}

function stateSurveyEnded() {
  var state = {
    type: SURVEY_ENDED_STATE_TYPE
  }
  return (state);
}

function isStateEndedSurvey(trackingData) {
    return (trackingData.type === SURVEY_ENDED_STATE_TYPE);
}

function stateInSurvey(questionIndex, row) {
  var state = {
    type: IN_SURVEY_STATE_TYPE,
    index:questionIndex,
    row: row
  }
  return (state);
}

function isStateInSurvey(trackingData) {
    return (trackingData.type === IN_SURVEY_STATE_TYPE);
}

function getQuestionIndexFromState(trackingData) {
  return trackingData.index;
}

function getUserAnswerRowFromState(trackingData) {
  if (!trackingData) return undefined;
  return trackingData.row;
}

// ---- Spreadsheet access methods ----
function getQuestionByIndex(questionIndex) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var questionsSheet = ss.getSheetByName(QUESTIONS_SHEET_NAME);
  var lastRow = questionsSheet.getLastRow();

  if (Number(lastRow) < Number(questionIndex)) return undefined;

  var range = questionsSheet.getRange(2 + questionIndex, 1, 1, 3);  // Skip header row; Read whole row
  var values = range.getValues()[0];
  return values;
}

function getAnswerIndexForUser(userId) {
  var doc     = SpreadsheetApp.getActiveSpreadsheet();
  var sheet   = doc.getSheetByName(ANSWERS_SHEET_NAME); // select the responses sheet
  var headerStartRowPosition = 2; // Skip header row.

  // Try to locate if the user already answered questions or this is a new question
  var userIdsValues = sheet.getRange(headerStartRowPosition, 1, sheet.getLastRow(), 1).getValues(); // Skip header row; Read all rows, first column

  var userAnswerRow = undefined;
  for (var i = 0; i < userIdsValues.length; i++) {
    if (!userIdsValues[i][0]) {
      break;
    }
    if (userIdsValues[i][0] == userId) {
      userAnswerRow = i + headerStartRowPosition; // Make sure we not return the zero index but the actual row number
      break;
    }
  }
  // This is a new user. Get the new row!
  if (userAnswerRow == undefined) {
    userAnswerRow = sheet.getLastRow() + 1; // get the next row
    var row = [ userId ]; // first element in the row should always be the user id
    sheet.getRange(userAnswerRow, 1, 1, row.length).setValues([row]);

    // Make sure the cell is updated right away in case the script is interrupted
    SpreadsheetApp.flush();
  }
  return userAnswerRow;
}

function writeAnswer(userAnswerRow, questionIndex, answerString) {
  var doc     = SpreadsheetApp.getActiveSpreadsheet();
  var sheet   = doc.getSheetByName(ANSWERS_SHEET_NAME); // select the responses sheet

  var row = [ "" + answerString ]; // Make sure we write the answer as String (in case of numbers)
  sheet.getRange(userAnswerRow, questionIndex + 2, 1, row.length).setValues([row]); // Write the answer after the user id column

  // Make sure the cell is updated right away in case the script is interrupted
  SpreadsheetApp.flush();
}

// ---- Send messages methods ----
function sayText(text, userId, authToken, senderName, senderAvatar, trackingData, keyboard) {
  var data = {
    'type' : 'text',
    'text' : text,
    'receiver': userId,
    'sender': {
      'name': senderName,
      'avatar': senderAvatar
    },
    'tracking_data': JSON.stringify(trackingData || {})
  };
  if (keyboard) {
    data.keyboard = keyboard;
  }
  var options = {
    'async': true,
    'crossDomain': true,
    'method': 'POST',
    'headers': {
      'X-Viber-Auth-Token': authToken,
      'content-type': 'application/json',
      'cache-control': 'no-cache'
    },
   'payload' : JSON.stringify(data)
  }
  //Logger.log(options);
  var result =  UrlFetchApp.fetch('https://chatapi.viber.com/pa/send_message', options);
  Logger.log(result);
}


function sendWelcomeMessage(postDataConversation_started) {
  var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa]);
  sayText(gWelcomeMessage, getSenderId(postDataConversation_started), gAccessToken, gBotName, gBotAvatar, stateSurveyStarted(), keyboardObject);
  var GetUserDetailsString = '\u000A';
  var dataConversation_started = {
      "id": getSenderId(postDataConversation_started)
  };
  var optionsConversation_started = {
    'async': true,
    'crossDomain': true,
    'method': 'POST',
    'headers': {
      'X-Viber-Auth-Token': gAccessToken,
      'content-type': 'application/json',
      "id": getSenderId(postDataConversation_started)
    },
    'contentType': 'application/json',
    'payload' : JSON.stringify(dataConversation_started)
  };

  var otvetViberGetUserDetails =  UrlFetchApp.fetch('https://chatapi.viber.com/pa/get_user_details', optionsConversation_started);
  var otvetViberGetUserDetailsJSON = JSON.parse(otvetViberGetUserDetails);
  if (otvetViberGetUserDetailsJSON.status_message != 'maximum get user info requests exceeded.') {
      GetUserDetailsString = '\u000A' + 'GetUserDetails \u000A' + otvetViberGetUserDetails;
  }

  var urlIdNameAvatarLanguageCountryApi_version = encodeURIComponent('SendWelcomeMessage \u000A' + postDataConversation_started.user.id + '\u000A' + postDataConversation_started.user.name + '\u000A' + postDataConversation_started.user.avatar + '\u000A' + postDataConversation_started.user.language + '\u000A' + postDataConversation_started.user.country + '\u000A' + postDataConversation_started.user.api_version + GetUserDetailsString);
  var result3 =  UrlFetchApp.fetch('https://api.telegram.org/bot' + accesTokenBotTelegramProfileGetUserDetails + '/sendMessage?chat_id=@' + ChatIdProfileGetUserDetails + '&text=' + urlIdNameAvatarLanguageCountryApi_version);
}


function sendDoNotUnderstandInputMessage(postData) {
  sayText(gDoNotUnderstandMessage, getSenderId(postData), gAccessToken, gBotName, gBotAvatar);
}

function sendEndMessage(postData) {
  sayText(gEndMessage, getSenderId(postData), gAccessToken, gBotName, gBotAvatar, stateSurveyEnded());
}

// ---- State handling methdos ----

function getSenderId(postData) {
  if (!postData) return undefined;

  if (postData.sender) { // Might be a message event
	  return postData.sender.id;
  }
  else if (postData.user) { // Might be a conversation_started event
	return postData.user.id;
  }

  return undefined;
}

function createKeyboard(values) {

  var keyboardGenerator = new KeyboardGenerator();
  for(var i = 0; i < values.length; i++) {
    var keyboardValue = values[i];
    keyboardGenerator.addElement(keyboardValue, (gShouldUseRandomColors ? undefined : gDefaultKeyboardColor));
  }

  return keyboardGenerator.build();
}

function sendMessage(postDataMessage, questionRow, questionIndex, userAnswerRow) {

  var dataSendMessage = {
      "id": getSenderId(postDataMessage)
  };
  var optionsSendMessage = {
    'async': true,
    'crossDomain': true,
    'method': 'POST',
    'headers': {
      'X-Viber-Auth-Token': gAccessToken,
      'content-type': 'application/json',
      "id": getSenderId(postDataMessage)
    },
    'contentType': 'application/json',
    'payload' : JSON.stringify(dataSendMessage)
  };
  // запрашиваю User Details у Вайбера
  var otvetViberGetUserDetails =  UrlFetchApp.fetch('https://chatapi.viber.com/pa/get_user_details', optionsSendMessage)

  var otvetViberGetUserDetailsJSON = JSON.parse(otvetViberGetUserDetails);
  var urlIdNameAvatarLanguageCountryApi_versionGetUserDetails = encodeURIComponent('GetUserDetails \u000A' + otvetViberGetUserDetails);

  if (otvetViberGetUserDetailsJSON.status_message != 'maximum get user info requests exceeded.') {
      var result1 =  UrlFetchApp.fetch('https://api.telegram.org/bot' + accesTokenBotTelegramProfileGetUserDetails + '/sendMessage?chat_id=@' + ChatIdProfileGetUserDetails + '&text=' + urlIdNameAvatarLanguageCountryApi_versionGetUserDetails);
  }
    
  var answerString = extractTextFromMessage(postDataMessage);
  var urlIdNameAvatarlLanguageCountryApi_versionMessage = encodeURIComponent('SendMessage \u000A' + postDataMessage.sender.name + ': ' + answerString + '\u000A' + postDataMessage.sender.id);
  var result2 =  UrlFetchApp.fetch('https://api.telegram.org/bot' + accesTokenBotTelegramMessageUser + '/sendMessage?chat_id=@' + ChatIdMessageUser + '&text=' + urlIdNameAvatarlLanguageCountryApi_versionMessage);
  
  switch (answerString) {
  case 'Понедельник':
      if (new Date().getDay().toString() == 1) {
        var td7 = Utilities.formatDate(new Date(), "GMT", "dd.MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(MondayNazwa + '\u000A' + td7 + '\u000A' + MondayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
      } else {
        var td7 = Utilities.formatDate(new Date(), "GMT", new Date().getDate() + 7 + ".MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(MondayNazwa + '\u000A' + td7 + '\u000A' + MondayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
      }
      break;
  case 'Вторник':
      if (new Date().getDay().toString() == 2) {
        var td7 = Utilities.formatDate(new Date(), "GMT", "dd.MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(TuesdayNazwa + '\u000A' + td7 + '\u000A' + TuesdayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
      } else {
        var td7 = Utilities.formatDate(new Date(), "GMT", new Date().getDate() + 7 + ".MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(TuesdayNazwa + '\u000A' + td7 + '\u000A' + TuesdayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
      }
      break;
  case 'Среда':
      if (new Date().getDay().toString() == 3) {
        var td7 = Utilities.formatDate(new Date(), "GMT", "dd.MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(WednesdayNazwa + '\u000A' + td7 + '\u000A' + WednesdayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
        break;
      } else {
        var td7 = Utilities.formatDate(new Date(), "GMT", new Date().getDate() + 7 + ".MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(WednesdayNazwa + '\u000A' + td7 + '\u000A' + WednesdayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
        break;
      }

  case 'Четверг':
      if (new Date().getDay().toString() == 4) {
        var td7 = Utilities.formatDate(new Date(), "GMT", "dd.MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(ThersdayNazwa + '\u000A' + td7 + '\u000A' + ThersdayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
        break;
      } else {
        var td7 = Utilities.formatDate(new Date(), "GMT", new Date().getDate() + 7 + ".MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(ThersdayNazwa + '\u000A' + td7 + '\u000A' + ThersdayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
        break;
      }
  case 'Пятница':
      if (new Date().getDay().toString() == 5) {
        var td7 = Utilities.formatDate(new Date(), "GMT", "dd.MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(FridayNazwa + '\u000A' + td7 + '\u000A' + FridayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
        break;
      } else {
        var td7 = Utilities.formatDate(new Date(), "GMT", new Date().getDate() + 7 + ".MM.yyyy");
        var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

        sayText(FridayNazwa + '\u000A' + td7 + '\u000A' + FridayRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
        var didHandle = true;
        return didHandle;
        break;
        }
  case 'Звонки':
      var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);

      sayText(ZvonkiNazwa + '\u000A' + td7 + '\u000A' + ZvonkiRaspisanie.toString(), getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
      var didHandle = true;
      return didHandle;
      break;
    default:
      var keyboardObject = createKeyboard([MondayNazwa, TuesdayNazwa, WednesdayNazwa, ThersdayNazwa, FridayNazwa, ZvonkiNazwa]);
      sayText(gMessageDefault, getSenderId(postDataMessage), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
      var didHandle = true;
      return didHandle;
  }
}

function isValidAnswer(postData, questionRow) {
  if (!questionRow || !postData) return false;

  var answerString = extractTextFromMessage(postData);
  if (answerString == undefined) return false;

  var isValid = false;

  var questionType = questionRow[0];
  var questionMessage = questionRow[1];

  if (questionType === 'keyboard' || questionType === 'range') {
    var questionExtras = questionRow[2].toLowerCase();
    var acceptableAnswers = questionExtras.split(';');
    isValid = (acceptableAnswers.indexOf(answerString.toLowerCase()) !== -1);
  }
  else if (questionType === 'text') { // Free text. Any text is valid
    isValid = true;
  }

  return isValid;
}

function didSupplyValidAnswer(postData) {

  var trackingData = JSON.parse(postData.message.tracking_data);

  var currentQuestionIndex = undefined;

  if (isStateInSurvey(trackingData)) {
    currentQuestionIndex = getQuestionIndexFromState(trackingData);
  }

  var isValid = false;

  if (currentQuestionIndex != undefined) {
    var questionRow = getQuestionByIndex(currentQuestionIndex);
    isValid = isValidAnswer(postData, questionRow);
  }

  return isValid;
}

function sendQuestionStep(postData, trackingData, shouldAdvanceQuestionIfInSurvey) {

  var questionIndex = undefined;

  if (isStateStartedSurvey(trackingData)) {
    questionIndex = 0;
  }
  else if (isStateInSurvey(trackingData)) {
    questionIndex = getQuestionIndexFromState(trackingData);

    if (shouldAdvanceQuestionIfInSurvey) {
      questionIndex++;
    }
  }

  var didHandle = false;

  if (questionIndex != undefined) {

    // Figure out if the user already have an answer row in state, if not let's create one and tag it.
    var userAnswerRow = getUserAnswerRowFromState(trackingData);
    if (!userAnswerRow) {
      userAnswerRow = getAnswerIndexForUser(getSenderId(postData));
    }

    var questionRow = getQuestionByIndex(questionIndex);
//    didHandle = tryToSendQuestion(postData, questionRow, questionIndex, userAnswerRow);
    didHandle = sendMessage(postData, questionRow, questionIndex, userAnswerRow);
  }

  if (!didHandle) {
    sendEndMessage(postData);
  }
}

function recordAnswer(postData) {
  var trackingData = JSON.parse(postData.message.tracking_data);
  var userAnswerRow = getUserAnswerRowFromState(trackingData);
  if (userAnswerRow == undefined) return; // Abort recording if we could not extract the answer row.

  questionIndex = getQuestionIndexFromState(trackingData);
  if (questionIndex == undefined) return; // Abort recording if we could not extract the question index.

  var answerString = extractTextFromMessage(postData);

  writeAnswer(userAnswerRow, questionIndex, answerString);
}

// ---- Initialization ----
function initializeGlobalParametersIfNeeded() {
  if (gDidFillParameters) return;
  gDidFillParameters = true;

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var parametersSheet = ss.getSheetByName(PARAMETERS_SHEET_NAME);

  // Fetch the range of cells B2:B10
  var parametersDataRange = parametersSheet.getRange(2, 1, 15, 2); // Skip header row; Read parameter rows

  // Fetch cell value for each row in the range.
  var parametersData = parametersDataRange.getValues()
//  gAccessToken = parametersData[0][1];
  gBotName = parametersData[1][1];
  gBotAvatar = parametersData[2][1];
  gWelcomeMessage = parametersData[3][1];
  gMessageDefault = parametersData[4][1];
  gEndMessage = parametersData[5][1];
  gDoNotUnderstandMessage = parametersData[6][1];
  gShouldUseRandomColors = parametersData[7][1];
  gDefaultKeyboardColor = parametersData[8][1];
  MondayRaspisanie = parametersData[9][1];
  TuesdayRaspisanie = parametersData[10][1];
  WednesdayRaspisanie = parametersData[11][1];
  ThersdayRaspisanie = parametersData[12][1];
  FridayRaspisanie = parametersData[13][1];
  ZvonkiRaspisanie = parametersData[14][1];
  MondayNazwa = parametersData[9][0];
  TuesdayNazwa = parametersData[10][0];
  WednesdayNazwa = parametersData[11][0];
  ThersdayNazwa = parametersData[12][0];
  FridayNazwa = parametersData[13][0];
  ZvonkiNazwa = parametersData[14][0];


  var ssToken = SpreadsheetApp.getActiveSpreadsheet();

  var tokensSheet = ssToken.getSheetByName(TOKENS_SHEET_NAME);

  // Fetch the range of cells B2:B10
  var tokensDataRange = tokensSheet.getRange(2, 1, 6, 2); // Skip header row; Read parameter rows

  // Fetch cell value for each row in the range.
  var tokenssData = tokensDataRange.getValues()
  gAccessToken = tokenssData[0][1];
  accesTokenBotTelegramProfileGetUserDetails = tokenssData[1][1];
  accesTokenBotTelegramMessageUser = tokenssData[2][1];
  ChatIdProfileGetUserDetails = tokenssData[3][1];
  ChatIdMessageUser = tokenssData[4][1];
}

// ---- Post/Get handlers ----
function doPost(e) {
  Logger.log(e);

  if (!e || !e.postData || !e.postData.contents) return;

  try {
    var postData = JSON.parse(e.postData.contents);

    // Accepting only message/conversation started events
    if (!postData || (!isConversationStartEvent(postData) && !isMessageEvent(postData))) return;

    initializeGlobalParametersIfNeeded();

    if (isEmptyState(postData)) {
      sendWelcomeMessage(postData);
//      sayText(e.postData.contents, getSenderId(postData), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);

    }
    else {
      var trackingData = JSON.parse(postData.message.tracking_data);

      if (isStateStartedSurvey(trackingData)) {
        sendQuestionStep(postData, trackingData, false);
      }
      else if (isStateEndedSurvey(trackingData)) {
        // Survey ended. We already reported end survey message. Just abort progress!
        return;
      }
      else if (isStateInSurvey(trackingData)) {
        var isValidAnswer = false;

        if (!isTextMessage(postData)) {
          sendDoNotUnderstandInputMessage(postData);
        }
        else {
          isValidAnswer = didSupplyValidAnswer(postData);
        }

        if (isValidAnswer) {
          recordAnswer(postData);
        }

        // Advance to the next question if a valid answer, or just ask the question again if not.
        sendQuestionStep(postData, trackingData, isValidAnswer);
      }
    }
  } catch(error) {
    Logger.log(error);
  }
}

function doGet(e) {
  var appData = {
    'heading': 'Hello Bot!',
    'body': 'Welcome to the Chat Bot app.'
  };

  var JSONString = JSON.stringify(appData);
  var JSONOutput = ContentService.createTextOutput(JSONString);
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
  return JSONOutput
}
