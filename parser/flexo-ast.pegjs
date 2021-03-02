
Content = _ chunks:(Text/Block/Tag/Space)* {
	return chunks.filter(Boolean);
}

Text = chars:$((!"{{" [^\n])+) {
	const text = chars.replace(/^\s*?\n\s*|\s*?\n\s*$/,"");
    if (!text) return null;
	return {$:"raw",text} ;
}

Space = space:$(__) {
	return {$:"raw",text:space } ;
}


Tag = Partial / RawTag / EscapedTag;

Block = _ block:(EachBlock/HelperBlock) _ {
 return block;
}

IfBlock = OPEN_BLOCK "if" __ expression:Expression CLOSE 
	thenBlock:Content elseBlock:ElseBlock?
  OPEN_END "if" CLOSE {
  return {$:"if",expression, thenBlock,elseBlock};  
}

EachBlock = OPEN_BLOCK "each" __ name:EachOf?  expression:Expression CLOSE 
	thenBlock:Content elseBlock:ElseBlock?
  OPEN_END "each" CLOSE {
  return {$:"each", name, expression, thenBlock,elseBlock};  
} 

EachOf = name:IDENT __ "of" __ {
	return name;
}

HelperBlock = OPEN_BLOCK ident:IDENT __ expression:Expression CLOSE 
	thenBlock:Content elseBlock:ElseBlock?
OPEN_END ident2:IDENT CLOSE {
  if (ident2 != ident) errror("{{/" + ident2 + "}} does not match {{#"+ ident + "}}");
  
  return {$:"block", ident, thenBlock, elseBlock};  
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

EscapedTag = !Else OPEN value:(Expression) CLOSE {
	return {$:"print",value}
}

RawTag = "{{{" value:(Expression) "}}}" {
	return {$:"raw",value}
}

Expression = (SingleValue/Helper)

SingleValue = value:Value CLOSING {
  return value;
}

Helper = ident:IDENT numbered:NumberedArgs named:NamedArgs {
	return {$:"helper",ident, numbered,named}
}



Partial = "{{>" _ ident:IDENT context:(ObjectSpec/_Expression) CLOSE {
	return {$:"partial",ident,context}
}

_Expression = __ expression:Expression {
	return expression
}

ObjectSpec = args:(__ key:IDENT _ "=" _ value:Value {
  return {key,value};
})+ {
	return args;
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

Value = String / Brackets / Number / DataPath 

Get = path:DataPath {
	return {$:"get",path}
}


Brackets = "(" _ helper:Helper _ ")" {
	return helper;
}




String = STRING 
Number = NUMBER 

DataPath = head:IDENT tail:DataPathTail {
	return [head,...tail]
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