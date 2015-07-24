module.exports = {
  code: 'en',
  base: 'yourself',
  join: function(rels){
    return rels.join("'s ");
  },
  patterns: [
    {
      pattern: 'f',
      rel: 'father'
    },
    {
      pattern: 'm',
      rel: 'mother'
    },
    {
      pattern: 's',
      rel: 'son'
    },
    {
      pattern: 'd',
      rel: 'daughter'
    },
    {
      pattern: 'c',
      rel: 'child'
    },
    {
      pattern: 'h',
      rel: 'husband'
    },
    {
      pattern: 'w',
      rel: 'wife'
    },
    {
      pattern: '(m|f)s',
      rel: 'brother'
    },
    {
      pattern: '(m|f)d',
      rel: 'sister'
    },
    {
      pattern: '(m|f)c',
      rel: 'sibling'
    },
    {
      pattern: '(m|f)f',
      rel: 'grandfather'
    },
    {
      pattern: '(m|f)m',
      rel: 'grandmother'
    },
    {
      pattern: '(m|f){2}f',
      rel: 'great-grandfather'
    },
    {
      pattern: '(m|f){2}m',
      rel: 'great-grandmother'
    },
    // nth great grandparent
    {
      pattern: '(m|f){4,}',
      rel: function(str){
        var suffix = str.substr(-1,1) === 'f' ? 'father' : 'mother',
            prefix = '',
            length = str.length;
        if(length == 4) {
          prefix = 'nd';
        } else if(length == 5) {
          prefix = 'rd';
        } else {
          prefix = 'th';
        }
        return (length-2)+prefix+' great-grand'+suffix;
      }
    },
    {
      pattern: '(s|d|c)s',
      rel: 'grandson'
    },
    {
      pattern: '(s|d|c)d',
      rel: 'granddaughter'
    },
    {
      pattern: '(s|d|c)c',
      rel: 'grandchild'
    },
    {
      pattern: '(s|d|c){2}s',
      rel: 'great-grandson'
    },
    {
      pattern: '(s|d|c){2}d',
      rel: 'great-granddaughter'
    },
    {
      pattern: '(s|d|c){2}c',
      rel: 'great-grandchild'
    },
    // nth great grandchild
    {
      pattern: '(s|d|c){4,}',
      rel: function(str){
        var lastChar = str.substr(-1,1),
            suffix = 'child',
            prefix = '',
            length = str.length;
        if(lastChar === 's'){
          suffix = 'son';
        } else if(lastChar === 'd'){
          suffix = 'daughter';
        }
        if(length == 4) {
          prefix = 'nd';
        } else if(length == 5) {
          prefix = 'rd';
        } else {
          prefix = 'th';
        }
        return (length-2)+prefix+' great-grand'+suffix;
      }
    },
    {
      pattern: '(h|w)f',
      rel: 'father-in-law'
    },
    {
      pattern: '(h|w)m',
      rel: 'mother-in-law'
    },
    // Spouse's siblings
    {
      pattern: '(h|w)(m|f)s',
      rel: 'brother-in-law'
    },
    {
      pattern: '(h|w)(m|f)d',
      rel: 'sister-in-law'
    },
    // Sibling's spouses
    {
      pattern: '(m|f)dh',
      rel: 'brother-in-law'
    },
    {
      pattern: '(m|f)sw',
      rel: 'sister-in-law'
    },
    {
      pattern: '(h|w)(m|f)c',
      rel: 'spouse\'s sibling'
    },
    {
      pattern: '(m|f){2}s',
      rel: 'uncle'
    },
    {
      pattern: '(m|f){2}d',
      rel: 'aunt'
    },
    {
      pattern: '(m|f){2}c',
      rel: 'parent\'s sibling'
    },
    {
      pattern: '(m|f){2}(d|s|c){2}',
      rel: 'cousin'
    },
    {
      pattern: '(m|f){3}s',
      rel: 'great-uncle'
    },
    {
      pattern: '(m|f){3}d',
      rel: 'great-aunt'
    },
    {
      pattern: 'dh',
      rel: 'son-in-law'
    },
    {
      pattern: 'sw',
      rel: 'daughter-in-law'
    },
    {
      pattern: '(m|f)(d|s|c)d',
      rel: 'niece'
    },
    {
      pattern: '(m|f)(d|s|c)s',
      rel: 'nephew'
    }
  ]
};