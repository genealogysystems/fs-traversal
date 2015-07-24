var testRelationships = require('./lib/relationships');

function testRel(rel, path){
  testRelationships('es', rel, path);
}

describe('lang - es', function(){

  it('should return "yourself"', function(){
    testRel('ego', []);
  });
  
  it('parents', function(){    
    testRel('el padre', ['father']);
    testRel('la madre', ['mother']);
  });
  
  it('children', function(){    
    testRel('el hijo', ['child']);
    testRel('el hijo', ['son']);
    testRel('la hija', ['daughter']);
  });
  
  it('spouses', function(){    
    testRel('el esposo', ['husband']);
    testRel('la esposa', ['wife']);
  });
  
  it('siblings', function(){    
    testRel('el hermano', ['father', 'son']);
    testRel('el hermano', ['mother', 'son']);
    testRel('la hermana', ['father', 'daughter']);
    testRel('la hermana', ['mother', 'daughter']);
    testRel('el hermano', ['father', 'child']);
    testRel('el hermano', ['mother', 'child']);
  });
  
  it('grandparents', function(){    
    testRel('el abuelo', ['father', 'father']);
    testRel('la abuela', ['father', 'mother']);
    testRel('el abuelo', ['mother', 'father']);
    testRel('la abuela', ['mother', 'mother']);
  });
  
  it('great-grandparents', function(){    
    testRel('el bisabuelo', ['father', 'father', 'father']);
    testRel('la bisabuela', ['father', 'father', 'mother']);
    testRel('el bisabuelo', ['father', 'mother', 'father']);
    testRel('la bisabuela', ['father', 'mother', 'mother']);
    testRel('el bisabuelo', ['mother', 'father', 'father']);
    testRel('la bisabuela', ['mother', 'father', 'mother']);
    testRel('el bisabuelo', ['mother', 'mother', 'father']);
    testRel('la bisabuela', ['mother', 'mother', 'mother']);
  });
  
  it('nth great grandparents', function(){
    testRel('la tatarabuela', ['mother', 'father', 'mother', 'mother']);
    testRel('la tatarabuela', ['father', 'mother', 'father', 'mother']);
    testRel('el tatarabuelo', ['father', 'father', 'mother', 'father']);
    testRel('el trastatarabuelo', ['father', 'father', 'mother', 'father', 'father']);
  });
  
  it('grandchildren', function(){    
    testRel('el nieto', ['son', 'son']);
    testRel('el nieto', ['daughter', 'son']);
    testRel('el nieto', ['child', 'son']);
    testRel('la nieta', ['son', 'daughter']);
    testRel('la nieta', ['daughter', 'daughter']);
    testRel('la nieta', ['child', 'daughter']);
    testRel('el nieto', ['son', 'child']);
    testRel('el nieto', ['daughter', 'child']);
    testRel('el nieto', ['child', 'child']);
  });
  
  it('great-grandchildren', function(){
    // Too many possible combinations here to test extensively
    testRel('el bisnieto', ['son', 'son', 'son']);
    testRel('el bisnieto', ['daughter', 'son', 'son']);
    testRel('el bisnieto', ['son', 'daughter', 'son']);
    testRel('el bisnieto', ['daughter', 'daughter', 'son']);
  });
  
  it('nth great grandchildren', function(){
    testRel('la tataranieta', ['daughter','son','daughter','daughter']);
    testRel('el tataranieto', ['daughter','son','daughter','son']);
    testRel('el tataranieto', ['daughter','son','daughter','child']);
    testRel('el hijo de la tataranieta', ['son','daughter','child','daughter','son']);
  });
  
  it('spouse\'s parents', function(){
    testRel('la suegra', ['husband', 'mother']);
    testRel('la suegra', ['wife', 'mother']);
    testRel('el suegro', ['husband', 'father']);
    testRel('el suegro', ['wife', 'father']);
  });
  
  it('spouses\'s siblings', function(){
    testRel('el cuñado', ['husband', 'mother', 'son']);
    testRel('el cuñado', ['husband', 'father', 'son']);
    testRel('el cuñado', ['wife', 'mother', 'son']);
    testRel('el cuñado', ['wife', 'father', 'son']);
    testRel('la cuñada', ['husband', 'mother', 'daughter']);
    testRel('la cuñada', ['husband', 'father', 'daughter']);
    testRel('la cuñada', ['wife', 'mother', 'daughter']);
    testRel('la cuñada', ['wife', 'father', 'daughter']);
    testRel('el cuñado', ['husband', 'mother', 'child']);
    testRel('el cuñado', ['husband', 'father', 'child']);
    testRel('el cuñado', ['wife', 'mother', 'child']);
    testRel('el cuñado', ['wife', 'father', 'child']);
  });
  
  it('sibling\'s spouses', function(){
    testRel('el cuñado', ['mother', 'daughter', 'husband']);
    testRel('el cuñado', ['father', 'daughter', 'husband']);
    testRel('la cuñada', ['mother', 'son', 'wife']);
    testRel('la cuñada', ['father', 'son', 'wife']);
  });
  
  it('uncle', function(){
    testRel('el tío', ['mother','mother','son']);
    testRel('el tío', ['mother','father','son']);
    testRel('el tío', ['father','mother','son']);
    testRel('el tío', ['father','father','son']);
  });
  
  it('aunt', function(){
    testRel('la tía', ['mother','mother','daughter']);
    testRel('la tía', ['mother','father','daughter']);
    testRel('la tía', ['father','mother','daughter']);
    testRel('la tía', ['father','father','daughter']);
  });
  
  it('parent\'s sibling', function(){
    testRel('el tío', ['mother','mother','child']);
    testRel('el tío', ['mother','father','child']);
    testRel('el tío', ['father','mother','child']);
    testRel('el tío', ['father','father','child']);
  });
  
  it('cousin', function(){
    // Too many possible combinations here to test extensively
    testRel('la prima', ['mother', 'mother', 'daughter', 'daughter']);
    testRel('el primo', ['mother', 'father', 'daughter', 'son']);
    testRel('la prima', ['mother', 'mother', 'son', 'daughter']);
    testRel('el primo', ['father', 'father', 'daughter', 'child']);
  });
  
  it('great-uncle', function(){
    testRel('el tío segundo', ['mother','father','mother','son']);
    testRel('el tío segundo', ['mother','father','father','son']);
  });
  
  it('great-aunt', function(){
    testRel('la tía segunda', ['mother','father','mother','daughter']);
    testRel('la tía segunda', ['mother','father','father','daughter']);
  });
  
  it('son-in-law', function(){
    testRel('el yerno', ['daughter','husband']);
  });
  
  it('daughter-in-law', function(){
    testRel('la nuera', ['son','wife']);
  });
  
  it('niece', function(){
    testRel('la sobrina', ['mother', 'son', 'daughter']);
    testRel('la sobrina', ['father', 'child', 'daughter']);
  });
  
  it('nephew', function(){
    testRel('el sobrino', ['mother', 'son', 'son']);
    testRel('el sobrino', ['father', 'child', 'son']);
  });

  it('great uncle\'s child', function(){
    testRel('el hijo del tío segundo', ['father', 'father', 'father', 'son', 'son']);
  });
  
  it('crazy', function(){
    testRel('la suegra del esposo de la prima de la cuñada', ['father', 'son', 'wife', 'mother', 'father', 'daughter', 'daughter', 'husband', 'wife', 'mother']);
  });

});