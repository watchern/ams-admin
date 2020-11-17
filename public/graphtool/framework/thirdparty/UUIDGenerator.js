/**
 * 
 * @Description: UUID生成器
 * 
*/
var UUIDGenerator = function(){   
    this.id = this.createUUID();   
}

UUIDGenerator.prototype.valueOf = function(){ return this.id; }   
UUIDGenerator.prototype.toString = function(){ return this.id; }   

UUIDGenerator.prototype.createUUID = function(){    
    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);   
    var dc = new Date();   
    var t = dc.getTime() - dg.getTime();   
    var tl = this.getIntegerBits(t,0,31);   
    var tm = this.getIntegerBits(t,32,47);   
    var thv = this.getIntegerBits(t,48,59) + '1';
    var csar = this.getIntegerBits(this.rand(4095),0,7);   
    var csl = this.getIntegerBits(this.rand(4095),0,7);   
    var n = this.getIntegerBits(this.rand(8191),0,7) +    
    		this.getIntegerBits(this.rand(8191),8,15) +    
            this.getIntegerBits(this.rand(8191),0,7) +    
            this.getIntegerBits(this.rand(8191),8,15) +    
            this.getIntegerBits(this.rand(8191),0,15);
    return tl + tm  + thv  + csar + csl + n;    
}   

UUIDGenerator.prototype.getIntegerBits = function(val,start,end){   
    var base16 = this.returnBase(val,16);   
    var quadArray = new Array();   
    var quadString = '';   
    var i = 0;   
    for(i=0;i<base16.length;i++){   
        quadArray.push(base16.substring(i,i+1));       
    }   
    for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){   
        if(!quadArray[i] || quadArray[i] == '') quadString += '0';   
        else quadString += quadArray[i];   
    }   
    return quadString;   
}   

UUIDGenerator.prototype.returnBase = function(number, base){   
    return (number).toString(base).toUpperCase();   
}   
  
UUIDGenerator.prototype.rand = function(max){   
    return Math.floor(Math.random() * (max + 1));   
}
