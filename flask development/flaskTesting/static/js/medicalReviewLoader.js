var data = new Array();
var idx = 0;
var sentIdx = 0;
var sentenceList = new Array();
var annotatedData = []; // This is the model that we will ultimatley persist to the flaskdb
var listOfArgTypes = []
var allPostsStructure = [];
var totalNoOfSentences = 0;

$.getJSON($SCRIPT_ROOT + '/loadAnnotations', function (loadedString) {

    var something = JSON.parse(loadedString);
    annotatedData = something;

});

$.getJSON($SCRIPT_ROOT + '/getDataSetStructure', function (dataStrucArray) {

    allPostsStructure = dataStrucArray;

    for (i = 0; i < allPostsStructure.length; i++) {
        totalNoOfSentences += allPostsStructure[i];
    }

});

$.getJSON($SCRIPT_ROOT + '/getPosts', function(jsonData) {
	
	data = jsonData
   
	initialiseSentenceArgTypes();
	insertReviewInfo();
	insertSentenceInfo();
	insertAnnotationInfo();
	insertAnnotationsProgress();

});

function insertReviewInfo() {

	console.log("insertReviewInfo");

	$("#Review").append(data[idx]["Post"]);
	$("#ReviewNo").append("Review No: " + idx);
	$("#Rating").append(data[idx]["Rating"]);
	$("#Drug").append(data[idx]["Drug"]);
}

function insertSentenceInfo() {

	review = data[idx]["Post"]

	if (sentenceList.length <= 0) {
		$.get($SCRIPT_ROOT + '/getSentence', {post: review}, success=function(sentences) {
			   console.log("new post tokenized");
			   sentenceList = sentences
			   $("#Sentence").append(sentenceList[sentIdx]);
			}
		);
	} 

	$("#Sentence").append(sentenceList[sentIdx]);

	$("#SentenceNo").text("Sentence No: " + sentIdx);
	
	clearArgTypeContents()
	
}

function insertAnnotationInfo() {

    console.log(annotatedData.length)
	var annotatedSentence = (annotatedData[idx])[sentIdx];

	for (i=0; i<annotatedSentence.length; i++){
		// If the arg was marked we show a tick, if not hide it
		if (annotatedSentence[i] > 0){
			$("#"+ "argType" + (i+1)).find("#argTick").removeClass("hidden");
		}
		else{
			$("#"+ "argType" + (i+1)).find("#argTick").addClass("hidden");
		}
	}
}

function insertAnnotationsProgress() { 
    
    var currentSentencesTagged = 0;

    for (i = 0; i < annotatedData.length; i++) {
        if (!annotatedData[i]) {
            currentSentencesTagged += 0;
            continue;
        }
            
        currentSentencesTagged += annotatedData[i].length;
    }

    var progress = (currentSentencesTagged / totalNoOfSentences) * 100;
    var progressStr = progress.toString().concat("%");

    $("#progress-bar").css("width", progressStr);
    $("#progress-bar").text(progressStr)



    for (i = 0; i < allPostsStructure.length; i++) {
        
        $("#progress-table")

        if(annotatedData[i]){
            tr = $('<tr/>');
            tr.append("<td>" + i.toString() + "</td>");
            
            sentencesMarked = ""

            for (j = 0; j < annotatedData[i].length; j++) {
                sentencesMarked = sentencesMarked.concat(j.toString() + " ")
            }

            tr.append("<td>" + sentencesMarked + "</td>");

            $("#progress-table").append(tr);
        }
        else {
            tr = $('<tr/>');
            tr.append("<td>" + i.toString() + "</td>");
            $("#progress-table").append(tr);
        }

    }

}

function gotoReview() {

	gotoIdx = document.getElementById('gotoarg').value

    idx = parseInt(gotoIdx)
	clearReviewContents();
	insertReviewInfo();
	insertSentenceInfo();
}

function changeReview(direction) {
	
	if (direction == "left" && idx > 0) {
		idx -= 1;
	}	

	if (direction == "right" && idx < data.length) {
		idx += 1;
	}	

	clearReviewContents();
	insertReviewInfo();
	insertSentenceInfo();
}

function changeSentence(direction) {

	if (direction == "left" && sentIdx > 0) {
		sentIdx -= 1;
	}	

	if (direction == "right" && sentIdx < sentenceList.length) {
		sentIdx += 1;
	}	
	
	clearSentenceContents();
	insertSentenceInfo(data);
}

function clearReviewContents() {

	// When we change the review, we need to clear all fields, includes emptying the sentence array
	$("#Review").empty();
	$("#ReviewNo").empty();
	$("#Rating").empty();
	$("#Drug").empty();

	// Reset all the sentence contents
	sentenceList.length = 0;
	sentIdx = 0;
	clearSentenceContents();
}

function clearSentenceContents() {

	$("#Sentence").empty();
}

function clearArgTypeContents() {

	// Make sure to check if we can insert annotation info
	if (typeof annotatedData[idx] === 'undefined'){
			for (i=0; i<listOfArgTypes.length; i++){
				var tick = $("#"+ "argType" + (i+1)).find("#argTick") 
				if (tick.hasClass("hidden")) {
					continue;
				}
				else { 
					tick.addClass("hidden");
				}
			}
	}

	else{
		var postAnnotation = annotatedData[idx];
		if (typeof postAnnotation[sentIdx] === 'undefined'){

			for (i=0; i<listOfArgTypes.length; i++){
				var tick = $("#"+ "argType" + (i+1)).find("#argTick") 
				if (tick.hasClass("hidden")) {
					continue;
				}
				else { 
					tick.addClass("hidden");
				}
			}
		}
		else{

			insertAnnotationInfo();	
		}
	}
}

function selectArgumentType(argId) {

	var argTypeNo = argId;
	argTypeNo = argTypeNo.replace("argType", "");

	// Have to do this because we have a list which starts with 0
	argTypeNo = parseInt(argTypeNo) - 1;

	changeArgumentType(argTypeNo);
}

function changeArgumentType(argTypeNo){

	// If the post has not been looked at before
	if (typeof annotatedData[idx] === 'undefined'){

		var currentAnnotationSentence = [];
		var currentAnnotationPost = [];
		for (i=0; i< listOfArgTypes.length; i++){
			currentAnnotationSentence[i] = 0;
		}
		
		currentAnnotationSentence[argTypeNo] = 1;
		currentAnnotationPost[sentIdx] = currentAnnotationSentence;
		annotatedData[idx] = currentAnnotationPost;
	}

	// If the post has been looked at, but the sentence hasn't
	else if (typeof (annotatedData[idx])[sentIdx] === 'undefined'){

		var currentAnnotationSentence = [];
		for (i=0; i< listOfArgTypes.length; i++){
			currentAnnotationSentence[i] = 0;
		}
		
		currentAnnotationSentence[argTypeNo] = 1;
		(annotatedData[idx])[sentIdx] = currentAnnotationSentence;
	}
	
	// If the post and sentence have been looked up. In this case we just need to toggle the argument type
	else {
		var currentAnnotationPost = annotatedData[idx];
		var currentAnnotationSentence = currentAnnotationPost[sentIdx];

		// If a person clicks on one of the buttons we need to switch the annotation for the argument pressed
		if (currentAnnotationSentence[argTypeNo] > 0){
			currentAnnotationSentence[argTypeNo] = 0;
		}
		else{
			currentAnnotationSentence[argTypeNo] = 1;
		}
	}

	insertAnnotationInfo();
}

function initialiseSentenceArgTypes(){

	listOfButtons = $("#argTypes").find("button")

	for(i=0;i<listOfButtons.length;i++){
		listOfArgTypes[i] = 0;
	}
}

function saveAnnotations() {

	annotatedDataString = JSON.stringify(annotatedData)

	$.get(
		$SCRIPT_ROOT + '/saveAnnotations',
		{ annotatedDataAll: annotatedDataString },
		function(message) {
			console.log(message);
		}
	);
}
