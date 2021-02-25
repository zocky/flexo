{
	const json = JSON.stringify.bind(JSON);
    
    const arr = items => "["+items.join(",")+"]";
    const obj = entries => "{"+entries.map(({key,value})=>json(key)+":"+value).join(",")+"}";
		const fn = block => `async ($)=>{\n${block}\n}`;
}

Content = _ chunks:(Text/Block/Tag/Space)* {
	return chunks.join('\n');
}

Text = chars:$((!"{{" [^\n])+) {
	const text = chars.replace(/^\s*?\n\s*|\s*?\n\s*$/,"");
    if (!text) return "";
	return "$.RAW("+JSON.stringify(text)+");";
}

Space = space:$(__) {
	return "$.RAW("+json(space)+")";
}


Tag = Partial / RawTag / EscapedTag;

Block = _ block:(WithBlock/EachBlock / IfBlock/ HelperBlock) _ {
 return block;
}

IfBlock = OPEN_BLOCK "if" __ value:Value CLOSE 
	block:Content block2:ElseBlock?
  OPEN_END "if" CLOSE {
  if (block2) {
    return `if(${value}) {\n${block}\n} else {\n${block2}\n};`
  }
  	return `if(${value}) {\n${block}\n};`
}

EachBlock = OPEN_BLOCK "each" __ name:EachOf? value:Value CLOSE 
	block:Content block2:ElseBlock?
  OPEN_END "each" CLOSE {
  if (block2) {
    return `await $.EACH(${value},${json(name)},${fn(block)},${fn(block2)});`
  }
    return `await $.EACH(${value},${json(name)},${fn(block)});`
} 

EachOf = name:IDENT __ "of" __ {
	return name;
}

HelperBlock = OPEN_BLOCK ident:IDENT numbered:NumberedArgs named:NamedArgs CLOSE 
	block:Content block2:ElseBlock?


OPEN_END ident2:IDENT CLOSE {
  if (ident !== ident2) error(`/${ident2} does not match #${ident}`);
  if (ident == "if" || ident=="each") error ("{{#"+ident + "}} syntax error");
  if (block2) {
    return `$.BLOCK(${json(ident)},${numbered},${named},()=>{(${block}},()=>{${block2}});`
  }
  	return "$.BLOCK("+json(ident)+",()=>{(\n"+block+"\n)});"
} 

OPEN = "{{" _
OPEN_BLOCK = "{{#" _
OPEN_END = "{{/" _
CLOSE = _ "}}"
CLOSING = & CLOSE;

Else = OPEN "else" _ CLOSE

ElseBlock = Else content:Content {
  return content;
}

EscapedTag = !Else OPEN value:(SingleValue/Helper) CLOSE {
	return "$.PRINT("+value+");";
}

RawTag = "{{{" value:(SingleValue/Helper) "}}}" {
	return "$.RAW("+value+")";
}

SingleValue = value:Value CLOSING {
  return value;
}

Helper = ident:IDENT numbered:NumberedArgs named:NamedArgs {
	return "await $.HELPER("+json(ident)+"," + arr(numbered) + ","+obj(named)+")";
}

Partial = "{{>" _ name:IDENT numbered:NumberedArgs named:NamedArgs CLOSE {
	let num = numbered.length;
    let nam = Object.keys(named).length;
    if (!num && !nam) return `await $.PARTIAL(${json(name)})`;
    if (!num && nam) return `await $.PARTIAL(${json(name)},${obj(named)})`;
    if (!nam && num===1) return `await $.PARTIAL(${json(name)},${numbered[0]})`;
    error("malformed partial call")
}

WithBlock
= OPEN_BLOCK "with" numbered:NumberedArgs named:NamedArgs CLOSE 
block:Content 
OPEN_END "with" CLOSE {
	let num = numbered.length;
	let nam = Object.keys(named).length;
	if (!num && nam) return `await $.WITH(${obj(named)},${fn(block)})`
	if (!nam && num===1) return `await $.WITH(${numbered[0]},${fn(block)})`
	error("malformed with")
}

NamedArgs = args:(__ key:IDENT _ "=" _ value:Value {
  return {key,value};
})* {
	return args;
}

NumberedArgs = args:(__ !(IDENT _ "=") value:Value {
  return value;
})* {
	return args
}


Value = String / Number / DataPath / Brackets

Brackets = "(" _ helper:Helper _ ")" {
	return helper;
}

String = str:STRING {
	return json(str);
}
Number = num:NUMBER {
	return json(num);
}

DataPath = head:IDENT tail:DataPathTail {
	return "(await $.GET(" + [head,...tail].map(json).join(',')+"))";
}

DataPathTail = ("." step:(IDENT/LITERAL) {
	return step;
})*;

LITERAL = STRING / NUMBER;
STRING = ('"' chars:$("\\" . / [^"] )* '"' {
  return chars;
}) / ("'" chars:$("\\" . / [^'] )* "'" {
  return chars;
}) 
NUMBER = chars:$([0-9]+ ( "." [0-9]+ )? ([Ee] [0-9]+)*) {
	return +chars;
}

IDENT = $([a-z_]i [a-z0-9_]i*)

__ = [ \n\t]+
_ = [ \n\t]*