module.exports = {
  code: 'es',
  base: 'ego',
  join: function(rels){
    rels.reverse();
    return rels.join(" de ").replace(/de el/g, 'del');
  },
  patterns: [
    {
      pattern: 'f',
      rel: 'el padre'
    },
    {
      pattern: 'm',
      rel: 'la madre'
    },
    {
      pattern: 's',
      rel: 'el hijo'
    },
    {
      pattern: 'd',
      rel: 'la hija'
    },
    {
      pattern: 'c',
      rel: 'el hijo'
    },
    {
      pattern: 'h',
      rel: 'el esposo'
    },
    {
      pattern: 'w',
      rel: 'la esposa'
    },
    {
      pattern: '(m|f)s',
      rel: 'el hermano'
    },
    {
      pattern: '(m|f)d',
      rel: 'la hermana'
    },
    {
      pattern: '(m|f)c',
      rel: 'el hermano'
    },
    // grandparents
    {
      pattern: '(m|f)f',
      rel: 'el abuelo'
    },
    {
      pattern: '(m|f)m',
      rel: 'la abuela'
    },
    {
      pattern: '(m|f){2}f',
      rel: 'el bisabuelo'
    },
    {
      pattern: '(m|f){2}m',
      rel: 'la bisabuela'
    },
    {
      pattern: '(m|f){3}f',
      rel: 'el tatarabuelo'
    },
    {
      pattern: '(m|f){3}m',
      rel: 'la tatarabuela'
    },
    {
      pattern: '(m|f){4}f',
      rel: 'el trastatarabuelo'
    },
    {
      pattern: '(m|f){4}m',
      rel: 'la trastatarabuela'
    },
    // grandchildren
    {
      pattern: '(s|d|c)s',
      rel: 'el nieto'
    },
    {
      pattern: '(s|d|c)d',
      rel: 'la nieta'
    },
    {
      pattern: '(s|d|c)c',
      rel: 'el nieto'
    },
    {
      pattern: '(s|d|c){2}s',
      rel: 'el bisnieto'
    },
    {
      pattern: '(s|d|c){2}d',
      rel: 'la bisnieta'
    },
    {
      pattern: '(s|d|c){2}c',
      rel: 'el bisnieto'
    },
    {
      pattern: '(s|d|c){3}s',
      rel: 'el tataranieto'
    },
    {
      pattern: '(s|d|c){3}d',
      rel: 'la tataranieta'
    },
    {
      pattern: '(s|d|c){3}c',
      rel: 'el tataranieto'
    },
    // In-laws
    {
      pattern: '(h|w)f',
      rel: 'el suegro'
    },
    {
      pattern: '(h|w)m',
      rel: 'la suegra'
    },
    // Spouse's siblings
    {
      pattern: '(h|w)(m|f)s',
      rel: 'el cuñado'
    },
    {
      pattern: '(h|w)(m|f)d',
      rel: 'la cuñada'
    },
    // Sibling's spouses
    {
      pattern: '(m|f)dh',
      rel: 'el cuñado'
    },
    {
      pattern: '(m|f)sw',
      rel: 'la cuñada'
    },
    {
      pattern: '(h|w)(m|f)c',
      rel: 'el cuñado'
    },
    {
      pattern: '(m|f){2}s',
      rel: 'el tío'
    },
    {
      pattern: '(m|f){2}d',
      rel: 'la tía'
    },
    {
      pattern: '(m|f){2}c',
      rel: 'el tío'
    },
    {
      pattern: '(m|f){2}(d|s|c)d',
      rel: 'la prima'
    },
    {
      pattern: '(m|f){2}(d|s|c)s',
      rel: 'el primo'
    },
    {
      pattern: '(m|f){2}(d|s|c)c',
      rel: 'el primo'
    },
    {
      pattern: '(m|f){3}s',
      rel: 'el tío segundo'
    },
    {
      pattern: '(m|f){3}d',
      rel: 'la tía segunda'
    },
    {
      pattern: 'dh',
      rel: 'el yerno'
    },
    {
      pattern: 'sw',
      rel: 'la nuera'
    },
    {
      pattern: '(m|f)(d|s|c)d',
      rel: 'la sobrina'
    },
    {
      pattern: '(m|f)(d|s|c)s',
      rel: 'el sobrino'
    }
  ]
};