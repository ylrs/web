//生成类
function produce() {

	var json = document.getElementById('textarea').value;

	try {
		var obj = JSON.parse(json);
		var classStr = getClassHeader();
		//解析json数据
		classStr = parseJsonModel(classStr,obj);
		classStr += getClassFooter();
		console.log(classStr);
		//获取类名称
		var className = getClassName();

		console.log("className:"+className);
		loadFile(className + ".h",classStr);

		var classImp = getClassImplementation();
		loadFile(className + ".m",classImp);
	}
	catch(err) {
		alert('json解析失败');
	}
	// console.log(Object.keys(obj));

}

function getClassName() {
	var className = document.getElementById('className').value;
	if (className == "请输入类名" || className.length == 0) {
		className = "LJBeikeModel"
	}
	return className
}

function getClassBy() {
	var classBy = document.getElementById('classBy').value;
	if (classBy == "Create By" || classBy.length == 0) {
		classBy = "lianjia"
	}
	return classBy
}

function getClassDate() {
	var date = new Date();

	// 获取当前月份
	var nowMonth = date.getMonth() + 1;

	// 获取当前是几号
	var nowDate = date.getDate();

	// 对月份进行处理，1-9月在前面添加一个“0”
	if (nowMonth >= 1 && nowMonth <= 9) {
		nowMonth = "0" + nowMonth;
	}

	// 对月份进行处理，1-9号在前面添加一个“0”
	if (nowDate >= 0 && nowDate <= 9) {
		nowDate = "0" + nowDate;
	}

	var classDate =  date.getFullYear() + '/' + nowMonth + '/' + nowDate
	return classDate
}

var classArray = [];

function parseJsonModel(classStr,obj) {
	for (var i = 0; i < Object.keys(obj).length; i++) {
		var model = Object.values(obj)[i]
		var key   = Object.keys(obj)[i]
		var keyName = firstUpperCase(key)
		var type = getModelType(model)
		if (type == "object") {
			classStr += "@property (nonatomic, copy) LJ" + keyName + "Model"+ " *" + key + ';\n'
			classStr += "@end\n\n"
			classStr += "@interface LJ" + keyName + "Model : NSObject\n"
			classArray.push("LJ" + keyName + "Model")
			classStr = parseJsonModel(classStr,model)
		}
		else if (type == "string") {
			classStr += "@property (nonatomic, copy) NSString *" + key + ';\n'
		}
		else if (type == "boolean") {
			classStr += "@property (nonatomic, assign) Bool " + key + ';\n'
		}
		else if (type == "number") {
			classStr += "@property (nonatomic, assign) NSInteger " + key + ';\n'
		}
		else if (type == "Array") {
			//判断数组中对象是简单数据类型还是object类型
			if (model.length > 0) {
				var item = model[0];
				var itemType = getModelType(item)
				if (itemType == "object") {
					var keyArrayName = firstUpperCase(key)

					classStr += "@property (nonatomic, copy) NSArray<LJArray"+keyArrayName+"Model> *" + key + ';\n'
					classStr += "@end\n\n"
					classStr += "@interface LJArray"+keyArrayName+"Model : NSObject\n"
					classArray.push("LJArray" + keyArrayName + "Model")

					classStr = parseJsonModel(classStr,item)
				}
				else {
					classStr += "@property (nonatomic, copy) NSArray *" + key + ';\n'

				}
			}
			else {
				classStr += "@property (nonatomic, copy) NSArray *" + key + ';\n'
			}

		}
	}

	return classStr
}

//字符串首字符大写
function firstUpperCase(str) {
	return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

function getModelType(model) {
	var type = typeof(model);

	//Array也会返回成object
	if (type == "object") {
		if (model.constructor == Array) {
			return "Array"
		}
	}
	return type;
}
//生成文件
function loadFile(fileName, content){
	var aLink = document.createElement('a');
	var blob = new Blob([content], {
		type: 'text/plain'
	});
	var evt = new Event('click');
	aLink.download = fileName;
	aLink.href = URL.createObjectURL(blob);
	aLink.click();
	URL.revokeObjectURL(blob);
}

//获取类固定头部信息
function getClassHeader() {

	var className = getClassName()
	var classDate = getClassDate()
	var classBy   = getClassBy()

	return  '//  '+className+'.h\n' +
	'//  Created by '+ classBy +' on '+classDate+'.\n'+
	'//\n'+
	'#import <Foundation/Foundation.h>\n'+
	'@interface '+className+' : NSObject\n'
}
//获取类固定尾部信息
function getClassFooter() {
	return '@end'
}

function getClassImplementation() {
	var className = getClassName()
	var classDate = getClassDate()
	var classBy   = getClassBy()

	var classStr = '//  '+className+'.m\n' +
	'//  Created by '+ classBy +' on '+classDate+'.\n'+
	'//\n'+
	'#import "'+className+'.h"\n'+
	'@implementation '+className+'\n'+
	'@end\n\n'

	if (classArray.length > 0) {
		for (var i = classArray.length - 1; i >= 0; i--) {
			var name = classArray[i]
			classStr += '@implementation '+name+'\n'
			classStr += '@end\n\n'
		}
	}
	return classStr;
}
