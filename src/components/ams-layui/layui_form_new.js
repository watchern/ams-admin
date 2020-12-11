var MOD_NAME = 'form_new';
(function($) {
	//单一select渲染：$("#assetsType").renderSel();
	$.fn.extend({
		renderSel:function(){
			var $=layui.$
				,dom=$(document), win=$(window)
			  ,THIS='layui-this', SHOW='layui-show', HIDE='layui-hide'
				  , DISABLED='layui-disabled';
			var TIPS = '请选择', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
	        ,NONE = 'layui-select-none', initValue = '', thatInput
	        ,selects = this, hide = function(e, clear){
	          if(!$(e.target).parent().hasClass(TITLE) || clear){
		        $('.'+CLASS).removeClass(CLASS+'ed ' + CLASS+'up');
	            thatInput && initValue && thatInput.val(initValue);
	          }
	          thatInput = null;
	        }
	        
	        ,events = function(reElem, disabled, isSearch){
	          var select = $(this)
	          ,title = reElem.find('.' + TITLE)
	          ,input = title.find('input')
	          ,dl = reElem.find('dl')
	          ,dds = dl.children('dd')
	          
	          
	          if(disabled) return;
	          
	          //展开下拉
	          var showDown = function(){
	            var top = reElem.offset().top + reElem.outerHeight() + 5 -win.scrollTop()
	            ,dlHeight = dl.outerHeight();
	            reElem.addClass(CLASS+'ed');
	            dds.removeClass(HIDE);
	            
	            //上下定位识别
	            if(top + dlHeight >win.height() && top >= dlHeight){
	              reElem.addClass(CLASS + 'up');
	            }
	          }, hideDown = function(choose){
	            reElem.removeClass(CLASS+'ed ' + CLASS+'up');
	            input.blur();
	            
	            if(choose) return;
	            
	            notOption(input.val(), function(none){
	              if(none){
	                initValue = dl.find('.'+THIS).html();
	                input && input.val(initValue);
	              }
	            });
	          };
	          
	          //点击标题区域
	          title.on('click', function(e){
	            reElem.hasClass(CLASS+'ed') ? (
	              hideDown()
	            ) : (
	              hide(e, true), 
	              showDown()
	            );
	            dl.find('.'+NONE).remove();
	          }); 
	          
	          //点击箭头获取焦点
	          title.find('.layui-edge').on('click', function(){
	            input.focus();
	          });
	          
	          //键盘事件
	          input.on('keyup', function(e){
	            var keyCode = e.keyCode;
	            //Tab键
	            if(keyCode === 9){
	              showDown();
	            }
	          }).on('keydown', function(e){
	            var keyCode = e.keyCode;
	            //Tab键
	            if(keyCode === 9){
	              hideDown();
	            } else if(keyCode === 13){ //回车键
	              e.preventDefault();
	            }
	          });
	          
	          //检测值是否不属于select项
	          var notOption = function(value, callback, origin){
	            var num = 0;
	            layui.each(dds, function(){
	              var othis = $(this)
	              ,text = othis.text()
	              ,not = text.indexOf(value) === -1;
	              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
	              origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](HIDE);
	            });
	            var none = num === dds.length;
	            return callback(none), none;
	          };
	          
	          //搜索匹配
	          var search = function(e){
	            var value = this.value, keyCode = e.keyCode;
	            
	            if(keyCode === 9 || keyCode === 13 
	              || keyCode === 37 || keyCode === 38 
	              || keyCode === 39 || keyCode === 40
	            ){
	              return false;
	            }
	            
	            notOption(value, function(none){
	              if(none){
	                dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">无匹配项</p>');
	              } else {
	                dl.find('.'+NONE).remove();
	              }
	            }, 'keyup');
	            
	            if(value === ''){
	              dl.find('.'+NONE).remove();
	            }
	          };
	          
	          if(isSearch){
	            input.on('keyup', search).on('blur', function(e){
	              thatInput = input;
	              initValue = dl.find('.' +THIS).html();
	              setTimeout(function(){
	                notOption(input.val(), function(none){
	                  initValue || input.val(''); //none && !initValue
	                }, 'blur');
	              }, 200);
	            });
	          }
	
	          //选择
	          dds.on('click', function(){
	            var othis = $(this), value = othis.attr('lay-value');
	            var filter = select.attr('lay-filter'); //获取过滤器
	
	            if(othis.hasClass(DISABLED)) return false;
	            
	            if(othis.hasClass('layui-select-tips')){
	              input.val('');
	            } else {
	              input.val(othis.text());
	              othis.addClass(THIS);
	            }
	            
	            othis.siblings().removeClass(THIS);
	            select.val(value).removeClass('layui-form-danger')
	            /*layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
	              elem: select[0]
	              ,value: value
	              ,othis: reElem
	            });*/
	            select.trigger("change");
	
	            hideDown(true);
	            return false;
	          });
	          
	          reElem.find('dl>dt').on('click', function(e){
	            return false;
	          });
	          //关闭下拉
	          $(document).off('click', hide).on('click', hide);
	        }
	        
	        selects.each(function(index, select){
	          var othis = $(this)
	          ,hasRender = othis.next('.'+CLASS)
	          ,disabled = this.disabled
	          ,value = select.value
	          ,selected = (select.selectedIndex==-1?"":$(select.options[select.selectedIndex])) //获取当前选中项
	          ,optionsFirst = select.options[0];
	          
	          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
	          
	          var isSearch = typeof othis.attr('lay-search') === 'string'
	          ,placeholder = optionsFirst ? (
	            optionsFirst.value ? TIPS : (optionsFirst.innerHTML || TIPS)
	          ) : TIPS;
	
	          //替代元素
	          var reElem = $(['<div class="'+ (isSearch ? '' : 'layui-unselect ') + CLASS + (disabled ? ' layui-select-disabled' : '') +'"   style="'+othis.attr("style")+'">'
	            ,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ placeholder +'" value="'+ (value ? selected.html() : '') +'" '+ (isSearch ? '' : 'readonly') +' class="layui-input'+ (isSearch ? '' : ' layui-unselect') + (disabled ? (' ' +DISABLED) : '') +'">'
	            ,'<i class="layui-edge"></i></div>'
	            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'+ function(options){
	              var arr = [];
	              layui.each(options, function(index, item){
	                if(index === 0 && !item.value){
	                  arr.push('<dd lay-value="" class="layui-select-tips">'+ (item.innerHTML || TIPS) +'</dd>');
	                } else if(item.tagName.toLowerCase() === 'optgroup'){
	                  arr.push('<dt>'+ item.label +'</dt>'); 
	                } else {
	                  arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ? THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
	                }
	              });
	              arr.length === 0 && arr.push('<dd lay-value="" class="'+DISABLED +'">没有选项</dd>');
	              return arr.join('');
	            }(othis.find('*')) +'</dl>'
	          ,'</div>'].join(''));
	          
	          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
	          othis.after(reElem);          
	          events.call(this, reElem, disabled, isSearch);
	        });
		}
	});
	$.fn.extend({
		LAYUIFORM:{
			config:{
				$:layui.$
				  ,layer:layui.layer
				  ,hint:layui.hint()
				  ,device:layui.device()
				  ,dom:$(document), win:$(window)
				  ,MOD_NAME:'form_new', ELEM:'.layui-form-new', THIS:'layui-this', SHOW:'layui-show', HIDE:'layui-hide'
					  , DISABLED:'layui-disabled'
			},
			set:function(options){
			    var that = this;
			    $.extend(true, that.config, options);
			    return that;
			  },
			  //验证规则设定
			verify : function(settings){
			    var that = this;
			    $.extend(true, that.config.verify, settings);
			    return that;
			  },
			  
			  //表单事件监听
			 on:function(events, callback){
			    return layui.onevent.call(this, MOD_NAME, events, callback);
			  },
			  
			  //表单控件渲染
			 render:function(type, filter){
			    var that = this
			    ,elemForm = $(that.config.ELEM + function(){
			      return filter ? ('[lay-filter="' + filter +'"]') : '';
			    }())
			    ,items = {
			    	textarea:function(){
			    		var textareaS = elemForm.find('textarea');
			    		textareaS.each(function(index, textArea){
				        	var othis = $(textArea);
			        		if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
					        //替代元素
					        var reElem = othis.addClass("layui-textarea");
					        var nextV = othis.next();
					        if("*"==nextV.text()){
						        reElem.css({"width": "97%","display": "inline"});
					        }
				        });
			    	},
			    	//普通输入框
					input: function(){
				        var commonInputs = elemForm.find('input'),
				        CLASS = "NEW_INIT",isPass;
				        commonInputs.each(function(index, input){
				        	var othis = $(input);
				        	isPass = othis.hasClass('layui-unselect')||othis.hasClass('Wdate')
				        		||othis.attr("type")=="hidden"||othis.attr("type")=="file";
				        	if(isPass){
					        	return;
				        	}else{
				        		if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
						        //元素
						        var reElem = othis.addClass("layui-input");
					        	var nextV = othis.next();

						        if("*"==nextV.text()){
						        	var wrapHtml = '<div class="layui-input-inline"></div>';
						        	nextV.remove();
							        reElem.after(nextV).wrap(wrapHtml);
						        }
				        	}
				        });
				  },
			      //下拉选择框
			      select: function(){
			        var TIPS = '请选择', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
			        ,NONE = 'layui-select-none', initValue = '', thatInput
			        
			        ,selects = elemForm.find('select'), hide = function(e, clear){
			          if(!$(e.target).parent().hasClass(TITLE) || clear){
			            $('.'+CLASS).removeClass(CLASS+'ed ' + CLASS+'up');
			            thatInput && initValue && thatInput.val(initValue);
			          }
			          thatInput = null;
			        }
			        
			        ,events = function(reElem, disabled, isSearch){
			          var select = $(this)
			          ,title = reElem.find('.' + TITLE)
			          ,input = title.find('input')
			          ,dl = reElem.find('dl')
			          ,dds = dl.children('dd')
			          
			          
			          if(disabled) return;
			          
			          //展开下拉
			          var showDown = function(){
			            var top = reElem.offset().top + reElem.outerHeight() + 5 - that.config.win.scrollTop()
			            ,dlHeight = dl.outerHeight();
			            reElem.addClass(CLASS+'ed');//modify
			            dds.removeClass(that.config.HIDE);
			            
			            //上下定位识别
			            if(top + dlHeight > that.config.win.height() && top >= dlHeight){
			              reElem.addClass(CLASS + 'up');//modify
			            }
			          }, hideDown = function(choose){
			            reElem.removeClass(CLASS+'ed ' + CLASS+'up');//modify
			            input.blur();
			            
			            if(choose) return;
			            
			            notOption(input.val(), function(none){
			              if(none){
			                initValue = dl.find('.'+that.config.THIS).html();
			                input && input.val(initValue);
			              }
			            });
			          };
			          
			          //点击标题区域
			          title.on('click', function(e){
			            reElem.hasClass(CLASS+'ed') ? (//modify
			              hideDown()
			            ) : (
			              hide(e, true), 
			              showDown()
			            );
			            dl.find('.'+NONE).remove();
			          }); 
			          
			          //点击箭头获取焦点
			          title.find('.layui-edge').on('click', function(){
			            input.focus();
			          });
			          
			          //键盘事件
			          input.on('keyup', function(e){
			            var keyCode = e.keyCode;
			            //Tab键
			            if(keyCode === 9){
			              showDown();
			            }
			          }).on('keydown', function(e){
			            var keyCode = e.keyCode;
			            //Tab键
			            if(keyCode === 9){
			              hideDown();
			            } else if(keyCode === 13){ //回车键
			              e.preventDefault();
			            }
			          });
			          
			          //检测值是否不属于select项
			          var notOption = function(value, callback, origin){
			            var num = 0;
			            layui.each(dds, function(){
			              var othis = $(this)
			              ,text = othis.text()
			              ,not = text.indexOf(value) === -1;
			              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
			              origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](that.config.HIDE);
			            });
			            var none = num === dds.length;
			            return callback(none), none;
			          };
			          
			          //搜索匹配
			          var search = function(e){
			            var value = this.value, keyCode = e.keyCode;
			            
			            if(keyCode === 9 || keyCode === 13 
			              || keyCode === 37 || keyCode === 38 
			              || keyCode === 39 || keyCode === 40
			            ){
			              return false;
			            }
			            
			            notOption(value, function(none){
			              if(none){
			                dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">无匹配项</p>');
			              } else {
			                dl.find('.'+NONE).remove();
			              }
			            }, 'keyup');
			            if(value === ''){
			              dl.find('.'+NONE).remove();
			            }
			          };
			          
			          if(isSearch){
			            input.on('keyup', search).on('blur', function(e){
			              thatInput = input;
			              initValue = dl.find('.' + that.config.THIS).html();
			              setTimeout(function(){
			                notOption(input.val(), function(none){
					            if(!select.hasClass("layui_write")){
					            	initValue || input.val(''); //none && !initValue
					            }else{
					            	select.append("<option value="+input.val()+" selected>"+input.val()+"</option>")
					            	.removeClass('layui-form-danger');
					            }
					            
			                }, 'blur');
			              }, 200);
			            });
			          }
			
			          //选择
			          dds.on('click', function(){
			            var othis = $(this), value = othis.attr('lay-value');
			            var filter = select.attr('lay-filter'); //获取过滤器
			
			            if(othis.hasClass(that.config.DISABLED)) return false;
			            
			            if(othis.hasClass('layui-select-tips')){
			              input.val('');
			            } else {
			              input.val(othis.text());
			              othis.addClass(that.config.THIS);
			            }
			            
			            othis.siblings().removeClass(that.config.THIS);
			            select.val(value).removeClass('layui-form-danger')
			            /*layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
			              elem: select[0]
			              ,value: value
			              ,othis: reElem
			            });*/
			            select.trigger("change");
			
			            hideDown(true);
			            return false;
			          });
			          
			          reElem.find('dl>dt').on('click', function(e){
			            return false;
			          });
			          
			          //关闭下拉
			          $(document).off('click', hide).on('click', hide);
			        }
			        
			        selects.each(function(index, select){
			          var othis = $(this)
			          ,hasRender = othis.next('.'+CLASS)
			          ,disabled = this.disabled
			          ,value = select.value
			          ,selected = (select.selectedIndex==-1?"":$(select.options[select.selectedIndex])) //获取当前选中项
			          ,optionsFirst = select.options[0];
			          
			          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
			          
			          var isSearch = typeof othis.attr('lay-search') === 'string'
			          ,placeholder = optionsFirst ? (
			            optionsFirst.value ? TIPS : (optionsFirst.innerHTML || TIPS)
			          ) : TIPS;
			
			          //替代元素
			          var reElem = $(['<div class="'+ (isSearch ? '' : 'layui-unselect ') + CLASS + (disabled ? ' layui-select-disabled' : '') +'" style="'+othis.attr("style")+'">'
			            ,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ placeholder +'" value="'+ (value ? selected.html() : '') +'" '+ (isSearch ? '' : 'readonly') +' class="layui-input'+ (isSearch ? '' : ' layui-unselect') + (disabled ? (' ' + that.config.DISABLED) : '') +'">'
			            ,'<i class="layui-edge"></i></div>'
			            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'+ function(options){
			              var arr = [];
			              layui.each(options, function(index, item){
			                if(index === 0 && !item.value){
			                  arr.push('<dd lay-value="" class="layui-select-tips">'+ (item.innerHTML || TIPS) +'</dd>');
			                } else if(item.tagName.toLowerCase() === 'optgroup'){
			                  arr.push('<dt>'+ item.label +'</dt>'); 
			                } else {
			                  arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  that.config.THIS : '') + (item.disabled ? (' '+that.config.DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
			                }
			              });
			              arr.length === 0 && arr.push('<dd lay-value="" class="'+ that.config.DISABLED +'">没有选项</dd>');
			              return arr.join('');
			            }(othis.find('*')) +'</dl>'
			          ,'</div>'].join(''));
			          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
			          othis.after(reElem);      
			          
			          //othis.on.call(reElem);
			          
			          //reElem.bind("onch",othis.onchange);
			          //reElem.attr("onchange",othis.attr("onchange"));
			          //document.getElementById("hello").dispatchEvent(evt);  
			          
			          events.call(this, reElem, disabled, isSearch);
			        });
			      }
			      //复选框/开关
			      ,checkbox: function(){
			        var CLASS = {
			          checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
			          ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
			        }
			        ,checks = elemForm.find('input[type=checkbox]')
			        
			        ,events = function(reElem, RE_CLASS){
			          var check = $(this);
			          
			          //勾选
			          reElem.on('click', function(){
			        	  //alert("aaa"+checks)
			            var filter = check.attr('lay-filter') //获取过滤器
			            ,text = (check.attr('lay-text')||'').split('|');
			
			            if(check[0].disabled) return;
			            
			            check[0].checked ? (
			              check[0].checked = false
			              ,reElem.removeClass(RE_CLASS[1]).find('em').text(text[1])
			            ) : (
			              check[0].checked = true
			              ,reElem.addClass(RE_CLASS[1]).find('em').text(text[0])
			            );
			            
			            /*layui.event.call(check[0], MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
			              elem: check[0]
			              ,value: check[0].value
			              ,othis: reElem
			            });*/
			              $(check).trigger("change");
			          });
			        }
			        
			        checks.each(function(index, check){
			          var othis = $(this), skin = othis.attr('lay-skin')
			          ,text = (othis.attr('lay-text')||'').split('|'), disabled = this.disabled;
			          if(skin === 'switch') skin = '_'+skin;
			          var RE_CLASS = CLASS[skin] || CLASS.checkbox;
			          
			          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
			          
			          //替代元素
			          var hasRender = othis.next('.' + RE_CLASS[0]);
			          var reElem = $(['<div class="layui-unselect '+ RE_CLASS[0] + (
			            check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' layui-checkbox-disbaled '+that.config.DISABLED : '') +'" lay-skin="'+ (skin||'') +'">'
			          ,{
			            _switch: '<em>'+ ((check.checked ? text[0] : text[1])||'') +'</em><i></i>'
			          }[skin] || ((check.title.replace(/\s/g, '') ? ('<span>'+ check.title +'</span>') : '') +'<i class="layui-icon">'+ (skin ? '&#xe605;' : '&#xe618;') +'</i>')
			          ,'</div>'].join(''));
			
			          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
			          othis.after(reElem);
			          events.call(this, reElem, RE_CLASS);
			        });
			      }
			      //单选框
			      ,radio: function(){
			        var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
			        ,radios = elemForm.find('input[type=radio]')
			        
			        ,events = function(reElem){
			          var radio = $(this), ANIM = 'layui-anim-scaleSpring';
			          
			          reElem.on('click', function(){
			            var name = radio[0].name, forms = radio.parents(that.config.ELEM);
			            var filter = radio.attr('lay-filter'); //获取过滤器
			            var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //找到相同name的兄弟
			            
			            if(radio[0].disabled) return;
			            
			            layui.each(sameRadio, function(){
			              var next = $(this).next('.'+CLASS);
			              this.checked = false;
			              next.removeClass(CLASS+'ed');
			              next.find('.layui-icon').removeClass(ANIM).html(ICON[1]);
			            });
			            
			            radio[0].checked = true;
			            reElem.addClass(CLASS+'ed');
			            reElem.find('.layui-icon').addClass(ANIM).html(ICON[0]);
			            
			            /*layui.event.call(radio[0], MOD_NAME, 'radio('+ filter +')', {
			              elem: radio[0]
			              ,value: radio[0].value
			              ,othis: reElem
			            });*/
			            radio.trigger("click");
			          });
			        };
			        
			        radios.each(function(index, radio){
			          var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;
			          
			          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
			          
			          //替代元素
			          var reElem = $(['<div class="layui-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' layui-radio-disbaled '+that.config.DISABLED : '') +'">'
			          ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
			          ,'<span>'+ (radio.title||'') +'</span>'
			          ,'</div>'].join(''));
			          
			          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
			          othis.after(reElem);
			          events.call(this, reElem);
			        });
			      }
			    };
			    type ? (
			      items[type] ? items[type]() : hint.error('不支持的'+ type + '表单渲染')
			    ) : layui.each(items, function(index, item){
			      item();
			    });
			    return that;
			  }
		}
		
	})
	
	/*$("#queryForm").renderLAYUI_SEARCHFORM();*/
	$.extend($.fn,{
			config:{
				$:layui.$
				  ,layer:layui.layer
				  ,hint:layui.hint()
				  ,device:layui.device()
				  ,dom:$(document), win:$(window)
				  ,MOD_NAME:'form_new', ELEM:'.layui-form', THIS:'layui-this', SHOW:'layui-show', HIDE:'layui-hide'
					  , DISABLED:'layui-disabled'
			},
			set:function(options){
			    var that = this;
			    $.extend(true, that.config, options);
			    return that;
			  },
			  //验证规则设定
			verify : function(settings){
			    var that = this;
			    $.extend(true, that.config.verify, settings);
			    return that;
			  },
			  //表单控件渲染
			 renderLAYUI_SEARCHFORM:function(type, filter){
			    var that = this
			    ,elemForm = this/*$(that.config.ELEM + function(){
			      return filter ? ('[lay-filter="' + filter +'"]') : '';
			    }())*/
			    ,items = {
			    	textarea:function(){
			    		var textareaS = elemForm.find('textarea');
			    		textareaS.each(function(index, textArea){
				        	var othis = $(textArea);
			        		if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
					        //替代元素
					        var reElem = othis.addClass("layui-textarea");
					        var nextV = othis.next();
					        var wrapHtml = '<div class="layui-input-inline" style="width:100%;"></div>';

					        if("*"==nextV.text()){
					        	nextV.remove();
						        reElem.after(nextV).wrap(wrapHtml);
					        }
				        });
			    	},
			    	//普通输入框
					input: function(){
				        var commonInputs = elemForm.find('input'),
				        CLASS = "NEW_INIT",isPass;
				        commonInputs.each(function(index, input){
				        	var othis = $(input);
				        	isPass = othis.hasClass('layui-unselect')
				        		||othis.attr("type")=="hidden"||othis.attr("type")=="file";
				        	if(isPass){
					        	return;
				        	}else{
				        		if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
				        		if(othis.hasClass('Wdate')){
				        			var tdpar = othis.parent();//tdpar表示td
				        			if(tdpar.children("input.Wdate").length==2){
				        				for(var i=0;i<2;i++){
				        					$(tdpar.children("input.Wdate")[i]).width(74)
				        				}
				        				tdpar.css("text-align","left");
				        				tdpar.html('<div class="kssj-searchform-listinfo cl333 kssj-block">'+tdpar.html()+'</div>');
				        			}
				        		}else{
				        			 //元素
							        var reElem = othis.addClass("layui-input");
						        	var nextV = othis.next();

							        if("*"==nextV.text()){
							        	var wrapHtml = '<div class="layui-input-inline"></div>';
							        	nextV.remove();
								        reElem.after(nextV).wrap(wrapHtml);
							        }else{
							        	var wrapHtml = '<div class="kssj-searchform-listinfo cl333"></div>';
							        	if(othis.parents("div")&&othis.parents("div").hasClass("cl333")){
							        		//Nothing to do 
							        	}else{
								        	reElem.wrap(wrapHtml);
							        	}
							        }
				        			
				        		}
				        	}
				        });
				  },
			      //下拉选择框
			      select: function(){
			        var TIPS = '请选择', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
			        ,NONE = 'layui-select-none', initValue = '', thatInput
			        
			        ,selects = elemForm.find('select'), hide = function(e, clear){
			          if(!$(e.target).parent().hasClass(TITLE) || clear){
			            $('.'+CLASS).removeClass(CLASS+'ed ' + CLASS+'up');
			            thatInput && initValue && thatInput.val(initValue);
			          }
			          thatInput = null;
			        }
			        
			        ,events = function(reElem, disabled, isSearch){
			          var select = $(this)
			          ,title = reElem.find('.' + TITLE)
			          ,input = title.find('input')
			          ,dl = reElem.find('dl')
			          ,dds = dl.children('dd')
			          
			          
			          if(disabled) return;
			          
			          //展开下拉
			          var showDown = function(){
			            var top = reElem.offset().top + reElem.outerHeight() + 5 - that.config.win.scrollTop()
			            ,dlHeight = dl.outerHeight();
			            reElem.addClass(CLASS+'ed');//modify
			            dds.removeClass(that.config.HIDE);
			            
			            //上下定位识别
			            if(top + dlHeight > that.config.win.height() && top >= dlHeight){
			              reElem.addClass(CLASS + 'up');//modify
			            }
			          }, hideDown = function(choose){
			            reElem.removeClass(CLASS+'ed ' + CLASS+'up');//modify
			            input.blur();
			            
			            if(choose) return;
			            
			            notOption(input.val(), function(none){
			              if(none){
			                initValue = dl.find('.'+that.config.THIS).html();
			                input && input.val(initValue);
			              }
			            });
			          };
			          
			          //点击标题区域
			          title.on('click', function(e){
			            reElem.hasClass(CLASS+'ed') ? (//modify
			              hideDown()
			            ) : (
			              hide(e, true), 
			              showDown()
			            );
			            dl.find('.'+NONE).remove();
			          }); 
			          
			          //点击箭头获取焦点
			          title.find('.layui-edge').on('click', function(){
			            input.focus();
			          });
			          
			          //键盘事件
			          input.on('keyup', function(e){
			            var keyCode = e.keyCode;
			            //Tab键
			            if(keyCode === 9){
			              showDown();
			            }
			          }).on('keydown', function(e){
			            var keyCode = e.keyCode;
			            //Tab键
			            if(keyCode === 9){
			              hideDown();
			            } else if(keyCode === 13){ //回车键
			              e.preventDefault();
			            }
			          });
			          
			          //检测值是否不属于select项
			          var notOption = function(value, callback, origin){
			            var num = 0;
			            layui.each(dds, function(){
			              var othis = $(this)
			              ,text = othis.text()
			              ,not = text.indexOf(value) === -1;
			              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
			              origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](that.config.HIDE);
			            });
			            var none = num === dds.length;
			            return callback(none), none;
			          };
			          
			          //搜索匹配
			          var search = function(e){
			            var value = this.value, keyCode = e.keyCode;
			            
			            if(keyCode === 9 || keyCode === 13 
			              || keyCode === 37 || keyCode === 38 
			              || keyCode === 39 || keyCode === 40
			            ){
			              return false;
			            }
			            
			            notOption(value, function(none){
			              if(none){
			                dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">无匹配项</p>');
			              } else {
			                dl.find('.'+NONE).remove();
			              }
			            }, 'keyup');
			            
			            if(value === ''){
			              dl.find('.'+NONE).remove();
			            }
			          };
			          
			          if(isSearch){
			            input.on('keyup', search).on('blur', function(e){
			              thatInput = input;
			              initValue = dl.find('.' + that.config.THIS).html();
			              setTimeout(function(){
			                notOption(input.val(), function(none){
			                  initValue || input.val(''); //none && !initValue
			                }, 'blur');
			              }, 200);
			            });
			          }
			
			          //选择
			          dds.on('click', function(){
			            var othis = $(this), value = othis.attr('lay-value');
			            var filter = select.attr('lay-filter'); //获取过滤器
			
			            if(othis.hasClass(that.config.DISABLED)) return false;
			            
			            if(othis.hasClass('layui-select-tips')){
			              input.val('');
			            } else {
			              input.val(othis.text());
			              othis.addClass(that.config.THIS);
			            }
			            
			            othis.siblings().removeClass(that.config.THIS);
			            select.val(value).removeClass('layui-form-danger')
			            /*layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
			              elem: select[0]
			              ,value: value
			              ,othis: reElem
			            });*/
			            select.trigger("change");
			
			            hideDown(true);
			            return false;
			          });
			          
			          reElem.find('dl>dt').on('click', function(e){
			            return false;
			          });
			          
			          //关闭下拉
			          $(document).off('click', hide).on('click', hide);
			        }
			        
			        selects.each(function(index, select){
			          var othis = $(this)
			          ,hasRender = othis.next('.'+CLASS)
			          ,disabled = this.disabled
			          ,value = select.value
			          ,selected = (select.selectedIndex==-1?"":$(select.options[select.selectedIndex])) //获取当前选中项
			          ,optionsFirst = select.options[0];
			          
			          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
			          
			          var isSearch = typeof othis.attr('lay-search') === 'string'
			          ,placeholder = optionsFirst ? (
			            optionsFirst.value ? TIPS : (optionsFirst.innerHTML || TIPS)
			          ) : TIPS;
			
			            
			          var wrapHtml = '<div class="kssj-searchform-listinfo cl333 kssj-block"></div>';
			          othis.wrap(wrapHtml);
			          //替代元素
			          var reElem = $(['<div class="'+ (isSearch ? '' : 'layui-unselect ') + CLASS + (disabled ? ' layui-select-disabled' : '') +'">'
			            ,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ placeholder +'" value="'+ (value ? selected.html() : '') +'" '+ (isSearch ? '' : 'readonly') +' class="layui-input'+ (isSearch ? '' : ' layui-unselect') + (disabled ? (' ' + that.config.DISABLED) : '') +'">'
			            ,'<i class="layui-edge"></i></div>'
			            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'+ function(options){
			              var arr = [];
			              layui.each(options, function(index, item){
			                if(index === 0 && !item.value){
			                  arr.push('<dd lay-value="" class="layui-select-tips">'+ (item.innerHTML || TIPS) +'</dd>');
			                } else if(item.tagName.toLowerCase() === 'optgroup'){
			                  arr.push('<dt>'+ item.label +'</dt>'); 
			                } else {
			                  arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  that.config.THIS : '') + (item.disabled ? (' '+that.config.DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
			                }
			              });
			              arr.length === 0 && arr.push('<dd lay-value="" class="'+ that.config.DISABLED +'">没有选项</dd>');
			              return arr.join('');
			            }(othis.find('*')) +'</dl>'
			          ,'</div>'].join(''));
			          
			          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
			          othis.after(reElem);      
			          //othis.on.call(reElem);
			          
			          //reElem.bind("onch",othis.onchange);
			          //reElem.attr("onchange",othis.attr("onchange"));
			          //document.getElementById("hello").dispatchEvent(evt);  
			          
			          events.call(this, reElem, disabled, isSearch);
			        });
			      }
			      //复选框/开关
			      ,checkbox: function(){
			        var CLASS = {
			          checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
			          ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
			        }
			        ,checks = elemForm.find('input[type=checkbox]')
			        
			        ,events = function(reElem, RE_CLASS){
			          var check = $(this);
			          
			          //勾选
			          reElem.on('click', function(){
			            var filter = check.attr('lay-filter') //获取过滤器
			            ,text = (check.attr('lay-text')||'').split('|');
			
			            if(check[0].disabled) return;
			            
			            check[0].checked ? (
			              check[0].checked = false
			              ,reElem.removeClass(RE_CLASS[1]).find('em').text(text[1])
			            ) : (
			              check[0].checked = true
			              ,reElem.addClass(RE_CLASS[1]).find('em').text(text[0])
			            );
			            /*layui.event.call(check[0], MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
			              elem: check[0]
			              ,value: check[0].value
			              ,othis: reElem
			            });*/
			              $(check).trigger("change");
			          });
			        }
			        
			        checks.each(function(index, check){
			          var othis = $(this), skin = othis.attr('lay-skin')
			          ,text = (othis.attr('lay-text')||'').split('|'), disabled = this.disabled;
			          if(skin === 'switch') skin = '_'+skin;
			          var RE_CLASS = CLASS[skin] || CLASS.checkbox;
			          
			          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
			          
			          //替代元素
			          var hasRender = othis.next('.' + RE_CLASS[0]);
			          var reElem = $(['<div class="layui-unselect '+ RE_CLASS[0] + (
			            check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' layui-checkbox-disbaled '+that.config.DISABLED : '') +'" lay-skin="'+ (skin||'') +'">'
			          ,{
			            _switch: '<em>'+ ((check.checked ? text[0] : text[1])||'') +'</em><i></i>'
			          }[skin] || ((check.title.replace(/\s/g, '') ? ('<span>'+ check.title +'</span>') : '') +'<i class="layui-icon">'+ (skin ? '&#xe605;' : '&#xe618;') +'</i>')
			          ,'</div>'].join(''));
			
			          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
			          othis.after(reElem);
			          events.call(this, reElem, RE_CLASS);
			        });
			      }
			      //单选框
			      ,radio: function(){
			        var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
			        ,radios = elemForm.find('input[type=radio]')
			        
			        ,events = function(reElem){
			          var radio = $(this), ANIM = 'layui-anim-scaleSpring';
			          
			          reElem.on('click', function(){
			            var name = radio[0].name, forms = radio.parents(that.config.ELEM);
			            var filter = radio.attr('lay-filter'); //获取过滤器
			            var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //找到相同name的兄弟
			            
			            if(radio[0].disabled) return;
			            
			            layui.each(sameRadio, function(){
			              var next = $(this).next('.'+CLASS);
			              this.checked = false;
			              next.removeClass(CLASS+'ed');
			              next.find('.layui-icon').removeClass(ANIM).html(ICON[1]);
			            });
			            
			            radio[0].checked = true;
			            reElem.addClass(CLASS+'ed');
			            reElem.find('.layui-icon').addClass(ANIM).html(ICON[0]);
			            
			            /*layui.event.call(radio[0], MOD_NAME, 'radio('+ filter +')', {
			              elem: radio[0]
			              ,value: radio[0].value
			              ,othis: reElem
			            });*/
			            radio.trigger("click");
			          });
			        };
			        
			        radios.each(function(index, radio){
			          var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;
			          
			          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
			          
			          //替代元素
			          var reElem = $(['<div class="layui-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' layui-radio-disbaled '+that.config.DISABLED : '') +'">'
			          ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
			          ,'<span>'+ (radio.title||'') +'</span>'
			          ,'</div>'].join(''));
			          
			          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
			          othis.after(reElem);
			          events.call(this, reElem);
			        });
			      }
			    };
			    type ? (
			      items[type] ? items[type]() : hint.error('不支持的'+ type + '表单渲染')
			    ) : layui.each(items, function(index, item){
			      item();
			    });
			    return that;
			  }
		})
})(jQuery);  
//$("#modifyAssetsBuyApply").LAYUIFORM.render("select");
 
