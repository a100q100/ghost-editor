(function() {
  'use strict';

  b3e.nodes.SetSharedBoolean = b3e.node.create('SetSharedBoolean', b3e.MODULATOR, {
    properties: [
      ['variable', b3e.properties.String, {title: 'Variable name'}]
    ],
  });
})();