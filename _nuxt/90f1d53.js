(window.webpackJsonp=window.webpackJsonp||[]).push([[6,3],{317:function(e,t,r){var content=r(320);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,r(68).default)("1bcf31c6",content,!0,{sourceMap:!1})},319:function(e,t,r){"use strict";r(317)},320:function(e,t,r){var n=r(66)(!1);n.push([e.i,".checked.correct[data-v-14117c30]{color:green!important}.checked.wrong[data-v-14117c30]{color:red!important}.checked[data-v-14117c30]{font-weight:700}",""]),e.exports=n},321:function(e,t,r){"use strict";r.r(t);r(5),r(4),r(2),r(1),r(6),r(3),r(7);var n=r(0),o=(r(13),r(67));function c(object,e){var t=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(object,e).enumerable}))),t.push.apply(t,r)}return t}var l={name:"Question",props:["question"],data:function(){return{selected:-1,checked:!1}},computed:function(e){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?c(Object(source),!0).forEach((function(t){Object(n.a)(e,t,source[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(source)):c(Object(source)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(source,t))}))}return e}({options:function(){var e=this;return this.question.answers.map((function(a,t){return{text:a,value:t,correct:t===e.question.correctAnswer}}))},answeredState:function(){var e={correct:(this.$store.state.questionLocal[this.question.id]||{correct:null}).correct};return!0===e.correct?(e.variant="success",e.text="Richtig"):!1===e.correct?(e.variant="danger",e.text="Falsch"):(e.text="Offen",e.variant="secondary"),e}},Object(o.b)("theme",["primaryButtonVariant","elementVariant","isDark"])),methods:{check:function(){this.checked=!0;var e=this.selected===this.question.correctAnswer;this.$store.commit("answerQuestion",{id:this.question.id,correct:e}),this.$emit("checked",e)},share:function(){navigator.share&&navigator.share({title:"Frage "+this.question.id+" ("+this.question.category+")",text:this.question.question,url:location.protocol+"//"+location.host+this.$router.resolve({name:"catalog-question",params:{question:this.question.id}}).href}).then((function(){return console.log("Successful share")})).catch((function(e){return console.log("Error sharing",e)}))}},watch:{question:function(){this.checked=!1,this.selected=-1}}},d=l,h=(r(319),r(47)),component=Object(h.a)(d,(function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",[r("b-row",[r("b-col",[r("h4",{staticClass:"d-inline-flex"},[e._v("Frage "+e._s(e.question.id)+" "),r("small",[r("b-badge",{staticClass:"ml-2",attrs:{pill:"",variant:e.answeredState.variant}},[e._v(e._s(e.answeredState.text))])],1)]),e._v(" "),r("span",{staticClass:"ml-2 mt-1 float-right"},[r("font-awesome-icon",{staticClass:"align-middle",attrs:{role:"button",icon:["fa","share-nodes"]},on:{click:e.share}})],1),e._v(" "),r("small",{staticClass:"d-block"},[e._v(" "+e._s(e.question.category)+" ")]),e._v(" "),r("p",[e._v(e._s(e.question.question))])])],1),e._v(" "),e.question.picture?r("b-row",{staticClass:"mb-4"},[r("b-col",[r("b-img",{attrs:{src:"img/"+e.question.id+".jpg"}}),e._v(" "),r("div",[r("small",[e._v("Die Bilder zu den Fragen sind urheberrechtlich geschützt. Die kommerzielle Verwertung in printform oder digital darf nur mit Genehmigung des jeweiligen Bildautors erfolgen.")])]),e._v(" "),r("div",[r("small",[r("a",{attrs:{href:"https://www.lfl.bayern.de/ifi/fischerpruefung/125173/index.php"}},[e._v("Nutzungsbedingungen und Rechteinhaber")])])])],1)],1):e._e(),e._v(" "),r("b-row",[r("b-col",{attrs:{cols:"12"}},[r("b-form-group",{attrs:{label:"Antworten"},scopedSlots:e._u([{key:"default",fn:function(t){var n=t.ariaDescribedby;return[r("b-form-radio-group",{staticClass:"btn-block",attrs:{required:"","aria-describedby":n,name:"radios-stacked",stacked:"",buttons:"","button-variant":e.elementVariant,size:"lg"},model:{value:e.selected,callback:function(t){e.selected=t},expression:"selected"}},e._l(e.options,(function(option){return r("b-form-radio",{key:option.valueAsNumber,class:{checked:e.checked,correct:option.correct,wrong:!option.correct},attrs:{value:option.value,disabled:e.checked&&option.value!==e.selected},on:{change:e.check}},[e._v("\n            "+e._s(option.text)+"\n          ")])})),1)]}}])})],1)],1)],1)}),[],!1,null,"14117c30",null);t.default=component.exports},350:function(e,t,r){"use strict";r.r(t);var n=r(25),o=r(17),c=(r(43),{asyncData:function(e){return Object(o.a)(regeneratorRuntime.mark((function t(){var r,o,c,l,d,h,f;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return r=e.$content,o=e.params,c=e.error,l=o.question,t.next=4,r({deep:!0}).where({id:{$eq:l}}).fetch();case 4:if(d=t.sent,h=Object(n.a)(d,1),f=h[0],console.log(f),null!=f){t.next=10;break}return t.abrupt("return",c({statusCode:404,message:"question not found"}));case 10:return t.abrupt("return",{question:f});case 11:case"end":return t.stop()}}),t)})))()},methods:{nextQuestion:function(){var e=this,t=this.$store.getters.categoryNames,r=this.$store.getters.filteredQuestionIds;if(r.length<=0)alert("Keine weiteren Fragen verfügbar, bitte Einstellungen prüfen!");else{var filter={category:{$in:t},id:{$in:r,$ne:this.question.id}};this.$content("catalog").where(filter).only(["id"]).fetch().then((function(t){var r=t[Math.floor(Math.random()*t.length)].id;e.$router.push("/catalog/"+r)}))}}}}),l=r(47),component=Object(l.a)(c,(function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",[r("Question",{attrs:{question:e.question}}),e._v(" "),r("b-row",{staticClass:"mt-2",attrs:{"align-h":"between"}},[r("b-col",[r("b-button",{attrs:{block:"",variant:"secondary"},on:{click:e.nextQuestion}},[e._v("Zufällige nächste Frage")])],1)],1)],1)}),[],!1,null,null,null);t.default=component.exports;installComponents(component,{Question:r(321).default})}}]);