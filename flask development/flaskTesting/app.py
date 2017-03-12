from flask import Flask, render_template, jsonify, request
import json
from nltk.tokenize import sent_tokenize

app = Flask(__name__)
allPosts = []

@app.route('/saveAnnotations')
def saveAnnotations():

	annotatedDataString = request.args.get('annotatedDataAll')
	print('we made it')
	print(type(annotatedDataString))
	print(annotatedDataString)

	annotatedDataAll = json.loads(annotatedDataString) 
	print(annotatedDataAll)

	with open('allAnnotations.json', 'w') as f:
		json.dump(annotatedDataString, f, ensure_ascii=False)

	return 'hello from the other side (flask)'


@app.route('/getPosts')
def getPosts():
	with open('ForumPosts.json') as json_data:
		d = json.load(json_data)
		allPosts = d
		return jsonify(d)


@app.route('/getSentence')
def getSentence():
	post = request.args.get('post')
	sent_tokenize_list = sent_tokenize(post)
	return jsonify(sent_tokenize_list)

@app.route('/getDataSetStructure')
def getDataSetStructure():
    with open('ForumPosts.json') as json_data:
        d = json.load(json_data)

        postsStructures = [0] * len(d)
        print(postsStructures)
        for idx, post in enumerate(d):
            postsStructures[idx] = len(sent_tokenize(post["Post"]))

    return jsonify(postsStructures)


@app.route('/loadAnnotations')
def loadAnnotations():
    print('loadposts')
    with open('allAnnotations.json') as f:
        loadAnnotations = json.load(f)
        print('hello from loadposts')
        print(jsonify(loadAnnotations))
        print(type(loadAnnotations))
        #return 'hello'
        return jsonify(loadAnnotations)

        
@app.route('/')
def index():
	return render_template('index.html')