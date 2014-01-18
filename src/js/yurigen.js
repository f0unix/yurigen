// handling the form

var $form 			= document.getElementById('form');
var $add_property 	= document.getElementById('add_property');
var $generate		= document.getElementById('generate');

var yurigen = {name:undefined , properties:{id:undefined}};
var count = 0;

$form.addEventListener('submit', function(event) {

	var variable_name 	= document.getElementById('variable').value;
	var property_name 	= document.getElementById('property_name').value;
	var property_value 	= document.getElementById('property_value').value;


	if( ! variable_name || ! property_name ){
		alert('One of the fields is empty');
		return false;
	}
	if( ! yurigen.name ){
		yurigen.name = variable_name;
	}
	if( yurigen.name ){
		if(! property_value){property_value = "undefined" ;}
		yurigen.properties[property_name] = property_value;
	}

	count++;
	
	document.getElementById('property_name').value 	= "";
	document.getElementById('property_value').value = "";
	document.getElementById('count_box').innerHTML = count;
	
	
	event.preventDefault();

}, true);


$generate.addEventListener('click', function(event) {

	if( ! yurigen.name || ! yurigen.properties ){
		alert("The variable \"yurigen\" is still empty ! PLease fill in some values");
		return false;
	}

	document.getElementById('output').value = generate_all(yurigen);

	
}, true);

// let the mutation begins 
// all the below functions generates the output 

function generate_uuid(){
	return "function uuid(){\nvar uuid = \"\", i, random;\nfor (i = 0; i < 32; i++){random = Math.random() * 16 | 0;\nif (i == 8 || i == 12 || i == 16 || i == 20){\nuuid += \"-\";\n}\nuuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);\n}\nreturn uuid;\n}\n";
}

function generate_var(yurigen){
	gen = "";
	gen += "var "+yurigen.name+" ={ \n";
	for(var prop in yurigen.properties) {
		if(yurigen.properties.hasOwnProperty(prop)){
			gen = gen+prop+" : "+yurigen.properties[prop]+",\n";
		}
	}
	return gen;
}


var functions_name = {
	'reset' : "reset: function(){",
	'create' : "create: function(){",
	'read_all' : "read_all: function(){",
	'readby' : "readby: function(){",
	'delete' : "delete: function(){"
}


function generate_functions( functions_name , yurigen ){
	gen = "";
	for( var prop in functions_name ){
		if(prop == "reset"){
			gen +="reset: function(){\n";
			for( var prop_name in yurigen.properties ){
				if( yurigen.properties.hasOwnProperty(prop_name) )	
					gen+="this."+ prop_name+ " = "+yurigen.properties[prop_name]+";\n";

			}
			gen+="},\n\n";
		}
		if(prop == "create"){
			gen +="create :function(){\n";
			for(var prop_name in yurigen.properties){
				if( yurigen.properties.hasOwnProperty(prop_name) ){	
					if(prop_name!='id')
						gen += "if (typeof this."+prop_name+" == "+"\"undefined\"){\nreturn false;\n}\n";
				}
			}
			if(yurigen.properties.hasOwnProperty('id')){
				gen += "this.id = uuid();\nvar saved_obj = window.localStorage.getItem(\""+yurigen.name+"\");\nvar saved_obj = JSON.parse( saved_obj );\nif ( ! saved_obj ){\nsaved_obj = [];\n}\nsaved_obj.push({";
					for(var prop_name in yurigen.properties){
						if(yurigen.properties.hasOwnProperty(prop_name))
							gen +=prop_name+" : this."+prop_name+", ";
					}
					gen+="});\nwindow.localStorage.setItem(\""+yurigen.name+"\",JSON.stringify(saved_obj));\nreturn this.id;\n";
}
gen+="},\n\n";
}
if(prop  == "read_all" ){
	gen +="read_all: function(){\nreturn JSON.parse( window.localStorage.getItem(\""+yurigen.name+"\") );\n},\n";
}
if(prop == "readby"){
	gen+="readby: function(){\nvar data = this.read_all();\n\nvar return_data = [];\nfor( x in data ){\n";
	for(var prop_name in yurigen.properties){
		if( yurigen.properties.hasOwnProperty(prop_name) ){	
			gen +="if ( typeof this."+prop_name+" != \"undefined\" && this."+prop_name+" != data[x]."+prop_name+" ){\ncontinue;\n}\n";	

		}
	}
	gen+="return_data.push( data[x] );\n}\nreturn return_data;\n},\n"
}
if(prop == "delete"){
	gen +="delete: function(){\nvar data = this.read_all();\n\nfor ( x in data ){\n";
	for(var prop_name in yurigen.properties){
		if( yurigen.properties.hasOwnProperty(prop_name) ){	
			gen +="if ( typeof "+yurigen.name+"."+prop_name+" != \"undefined\" && this."+prop_name+" != data[x]."+prop_name+" ){\ndata = data.splice(x, 1);\n}\n";	
		}
	}

	gen+="}\nwindow.localStorage.setItem(\""+yurigen.name+"\", JSON.stringify(data));\nreturn true;\n}\n\n};\n"
}

}
return gen;
}
function generate_all(yurigen){
	s1 = generate_uuid()+"\n";
	s2 = generate_var(yurigen)+"\n";
	s3 = generate_functions(functions_name,yurigen)+"\n";
	total = s1+s2+s3;
	return total;
}
