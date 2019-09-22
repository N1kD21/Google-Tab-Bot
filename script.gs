

var sheetTabTimetable = SpreadsheetApp.getActiveSheet(PARAMETERS_SHEET_NAME).getRange(2, 1, 8, 2).getValues();

var gAccessToken = sheetTabTimetable[0][1];
var gBotName = sheetTabTimetable[1][1];
var gBotAvatar = sheetTabTimetable[2][1];


var MondayTimetable = sheetTabTimetable [3][1]
var TuesadayTimetable = sheetTabTimetable [4][1]
var WednesdayTimetable = sheetTabTimetable [5][1]
var ThersdayTimetable = sheetTabTimetable [6][1]
var FridayTimetable = sheetTabTimetable [7][1]


// ---- State handling methdos ----

function getSenderId(infoObOtpraviteleID) {
  if (!infoObOtpraviteleID) return undefined;

  if (infoObOtpraviteleID.sender) { // Might be a message event
	  return infoObOtpraviteleID.sender.id;
  }
  else if (infoObOtpraviteleID.user) { // Might be a conversation_started event
	return infoObOtpraviteleID.user.id;
  }

  return undefined;
}

function recordAnswer(objectMessage) {
  var trackingData = JSON.parse(objectMessage.message.tracking_data);

  var answerStringNameDay = extractTextFromMessage(objectMessage);
  return answerStringNameDay;
}


function sayText(raspisanieNaDen, userId, authToken, senderName, senderAvatar, trackingData, keyboard) {

  var data = {
    'type' : 'text',
    'text' : raspisanieNaDen,
    'receiver': userId,
    'sender': {
      'name': senderName,
      'avatar': senderAvatar
    },
    'tracking_data': 'tracking_data'
  };

/*
  if (keyboard) {
    data.keyboard = keyboard;
  }
*/

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




function extractTextFromMessage(postDataIzvlechenieTexta) {                   // extract - извлечение => extractTextFromMessage - извлечение текста из message
  if (!postDataIzvlechenieTexta || !postDataIzvlechenieTexta.message) return undefined;

  return postDataIzvlechenieTexta.message.text;
}

//-----
function isEvent(postDataAboutEvent, event) {                                         // сравнение пришедшего Евента с шаблоном.
  return (postDataAboutEvent.event == event);
}

function isConversationStartEvent(postDataConversationStartEvent) {
  return isEvent(postDataConversationStartEvent, 'conversation_started'); // проверяем является ли пришедший Евент - conversation_started
}

function isMessageEvent(postDataMessageEvent) {
  return isEvent(postDataMessageEvent, 'message');              // Проверка является ли пришедший Евент - message
}

//------


function doGet(e) {
  var applicationDataFirstMessageToPolzovatel = {
    'heading': 'Hello Bot!',
    'body': 'Welcome to the Chat Bot app.'
  };

  var JSONString = JSON.stringify(applicationDataFirstMessageToPolzovatel);
  var JSONOutput = ContentService.createTextOutput(JSONString);
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
  return JSONOutput
}


function doPost(dannieOtPolzovatel) {
  Logger.log(dannieOtPolzovatel);

  if (!dannieOtPolzovatel || !dannieOtPolzovatel.postData || !dannieOtPolzovatel.postData.contents) return;

  try {
    var zaprosphraseBotViber = JSON.parse(dannieOtPolzovatel.postData.contents);

    // Accepting only message/conversation started events
    if (!zaprosphraseBotViber || (!isConversationStartEvent(zaprosphraseBotViber) && !isMessageEvent(zaprosphraseBotViber))) return;

    var nomerDen = recordAnswer(zaprosphraseBotViber);
    var userId = getSenderId(zaprosphraseBotViber);
    if (zaprosphraseBotViber == 'PN') {
      sayText(MondayTimetable, userId, gAccessToken, gBotName, gBotAvatar)
    }

  } catch(error) {
    Logger.log(error);
  }
}



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

/*
// Constants
var PARAMETERS_SHEET_NAME = 'parameters';
var LIST_NAME_question = 'questions';
var ANSWERS_SHEET_NAME = 'answers';
var SURVEY_STARTED_STATE_TYPE = 'started';
var SURVEY_ENDED_STATE_TYPE = 'ended';
var IN_SURVEY_STATE_TYPE = 'survey';

// Global parameters (Values will be read from the parameters sheet)
var gDidFillParameters = false;
var gAccessToken = 'Your access token value from the parameters sheet';
var gBotName = 'Your bot name from the parameters sheet';
var gBotAvatar = 'Your bot avatar url from the parameters sheet';
var gMondayMessage = 'Your welcome message from the parameters sheet';
var gWelcomeStartButton = 'Your welcome start button from the parameters sheet';
var gEndMessage = 'Your end message from the parameters sheet';
var gDoNotUnderstandMessage = 'Your do not understand input message from the parameters sheet';
var gShouldUseRandomColors = false;
var gDefaultKeyboardColor = 'Your default keyboard option color from the parameters sheet';

// ---- Input validation methods ----   // Методы проверки ввода
function isEvent(postDataAboutEvent, event) {
  return (postDataAboutEvent.event == event);
}

function isMessageEvent(postDataMessageEvent) {
  return isEvent(postDataMessageEvent, 'message');              // Проверка является ли пришедший Евент - message
}

function isMessageType(postDataMessageType, type) {
  if (!isMessageEvent(postDataMessageType)) return false;                 // Если этот пришедший Евент не message, возвращаем false
  if (!postDataMessageType.message ||  postDataMessageType.message.type !== type) return false;

  return true;
}

function isConversationStartEvent(postDataConversationStartEvent) {
  return isEvent(postDataConversationStartEvent, 'conversation_started'); // проверяем является ли пришедший Евент - conversation_started
}

function isTextMessage(postDataTextMessageType) {
  return isMessageType(postDataTextMessageType, 'text');     // проверяем является ли пришедший message типом "text"
}

function extractTextFromMessage(postDataIzvlechenieTexta) {                   // extract - извлечение => extractTextFromMessage - извлечение текста из message
  if (!postDataIzvlechenieTexta || !postDataIzvlechenieTexta.message) return undefined;

  return postDataIzvlechenieTexta.message.text;
}

// ---- Tracking data state methods ---- Методы отслеживания состояния данных

function isEmptyState(postData) {         // "пустое состояние"
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

  var questionsSheet = ss.getSheetByName(LIST_NAME_question);
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
//    userAnswerRow = undefined;
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

*/
//========================================================================================================
// ---- Send messages methods ----    Отсылание письма


//==============================================================================================================================



/*
function sendWelcomeMessage(postData) {
  var keyboardObject = createKeyboard([gWelcomeStartButton]);
  sayText(gMondayMessage, getSenderId(postData), gAccessToken, gBotName, gBotAvatar, stateSurveyStarted(), keyboardObject);
}
*/

/*
function sendDoNotUnderstandInputMessage(postData) {
  sayText(gDoNotUnderstandMessage, getSenderId(postData), gAccessToken, gBotName, gBotAvatar);
}

function sendEndMessage(postData) {
  sayText(gEndMessage, getSenderId(postData), gAccessToken, gBotName, gBotAvatar, stateSurveyEnded());
}
*/

/*
function createKeyboard(values) {

  var keyboardGenerator = new KeyboardGenerator();
  for(var i = 0; i < values.length; i++) {
    var keyboardValue = values[i];
    keyboardGenerator.addElement(keyboardValue, (gShouldUseRandomColors ? undefined : gDefaultKeyboardColor));
  }

  return keyboardGenerator.build();
}

*/
//----------------------------------------------------------------------------------------------------------------------------------------
/*
function tryToSendQuestion(postData, questionRow, questionIndex, userAnswerRow) {
  if (!questionRow || !postData || questionIndex == undefined || userAnswerRow == undefined) return false;

  var didHandle = false;

  var questionType = questionRow[0];
  var questionMessage = questionRow[1];

/*
  if (questionType === 'keyboard') {
    var questionExtras = questionRow[2];
    var keyboardFields = questionExtras.split(';');
    var keyboardObject = createKeyboard(keyboardFields);
    sayText(questionMessage, getSenderId(postData), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow), keyboardObject);
    didHandle = true;
  }

  else //
   if (questionType === 'text' || questionType === 'range') {
    sayText(questionMessage, getSenderId(postData), gAccessToken, gBotName, gBotAvatar, stateInSurvey(questionIndex, userAnswerRow));
    didHandle = true;
  }

  return didHandle;
}
*/
//-----------------------------------------------------------------------------------------------------------------------------------------


/*      Запись ответа или проверка валидности ответа
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
*/

/*

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
    didHandle = tryToSendQuestion(postData, questionRow, questionIndex, userAnswerRow);
  }

  if (!didHandle) {
    sendEndMessage(postData);
  }
}
*/




/*

*/



// ---- Initialization ----
/*
function initializeGlobalParametersIfNeeded() {
  if (gDidFillParameters) return;
  gDidFillParameters = true;

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var parametersSheet = ss.getSheetByName(PARAMETERS_SHEET_NAME);

  // Fetch the range of cells B2:B10
  var parametersDataRange = parametersSheet.getRange(2, 1, 9, 2); // Skip header row; Read parameter rows
  var values = SpreadsheetApp.getActiveSheet().getRange(2, 3, 6, 4).getValues();
  Logger.log(values[0][0]);

*/




  // Fetch cell value for each row in the range.
/*
  var parametersData = parametersDataRange.getValues()
  gAccessToken = parametersData[0][1];
  gBotName = parametersData[1][1];
  gBotAvatar = parametersData[2][1];
  //gWelcomeMessage = parametersData[3][1];
  gMondayMessage = parametersData[3][1];
  gWelcomeStartButton = parametersData[4][1];
  gEndMessage = parametersData[5][1];
  gDoNotUnderstandMessage = parametersData[6][1];
  gShouldUseRandomColors = parametersData[7][1];
  gDefaultKeyboardColor = parametersData[8][1];
----

  var parametersData = parametersDataRange.getValues()
  gAccessToken = parametersData[0][1];
  gBotName = parametersData[1][1];
  gBotAvatar = parametersData[2][1];
  //gWelcomeMessage = parametersData[3][1];
  gMondayMessage = parametersData[3][1];
  gWelcomeStartButton = parametersData[4][1];
  gEndMessage = parametersData[5][1];
  gDoNotUnderstandMessage = parametersData[6][1];
  gShouldUseRandomColors = parametersData[7][1];
  gDefaultKeyboardColor = parametersData[8][1];
}

*/
// ---- Post/Get handlers ----

/*
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
    }
    else {
      var trackingData = JSON.parse(postData.message.tracking_data);

      if (isStateStartedSurvey(trackingData)) {
        sendQuestionStep(postData, trackingData, false);
      }
      else if (isStateEndedSurvey(trackingData)) {
        // Survey ended. We already reported end survey message. Just abort progress!    Опрос закончен. Мы уже сообщили об окончании опроса. Просто прервите прогресс!
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
*/
