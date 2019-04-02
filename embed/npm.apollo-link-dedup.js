(window.webpackJsonp=window.webpackJsonp||[]).push([[52],{83:function(e,t,r){"use strict";r.d(t,"a",function(){return s});var n=r(11),o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])})(e,t)};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */var s=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.inFlightRequestObservables=new Map,t.subscribers=new Map,t}return function(e,t){function r(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)}(t,e),t.prototype.request=function(e,t){var r=this;if(e.getContext().forceFetch)return t(e);var o=e.toKey(),s=function(e){return r.inFlightRequestObservables.delete(e),r.subscribers.get(e)};if(!this.inFlightRequestObservables.get(o)){var i,c=t(e),u=new n.b(function(e){var t=r.subscribers.get(o);return t||(t={next:[],error:[],complete:[]}),r.subscribers.set(o,{next:t.next.concat([e.next.bind(e)]),error:t.error.concat([e.error.bind(e)]),complete:t.complete.concat([e.complete.bind(e)])}),i||(i=c.subscribe({next:function(e){var t=s(o);r.subscribers.delete(o),t&&(t.next.forEach(function(t){return t(e)}),t.complete.forEach(function(e){return e()}))},error:function(e){var t=s(o);r.subscribers.delete(o),t&&t.error.forEach(function(t){return t(e)})}})),function(){i&&i.unsubscribe(),r.inFlightRequestObservables.delete(o)}});this.inFlightRequestObservables.set(o,u)}return this.inFlightRequestObservables.get(o)},t}(n.a)}}]);