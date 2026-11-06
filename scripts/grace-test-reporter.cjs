'use strict';
module.exports=async function*(events){for await(const event of events){if(['test:pass','test:fail'].includes(event.type))yield JSON.stringify({type:event.type,name:event.data.name,error:event.data.details?.error?.message?.split('\n')[0]||''})+'\n';}};
