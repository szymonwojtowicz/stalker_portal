/**
 * Video Club module.
 */
(function(){
    
    //stb.ajax_loader = 'http://bb2.sandbox/stalker_portal/server/load.php'
    
    /* VCLUB */
    function vclub_constructor(){
        
        this.layer_name = 'vclub';
        
        this.row_blocks  = ['hd', 'sd', 'fav', 'lock', 'name', 'today', 'yesterday', 'week_and_more'];
        
        this.load_params = {
            'type'   : 'vod',
            'action' : 'get_ordered_list'
        };
        
        this.superclass = ListLayer.prototype;
        
        this.category_alias = '';
        
        this.sort_menu = {};
        
        this.search_box = {};
        
        this.view_menu = {};
        
        this.other_menu = {};
        
        this.row_callback_timer;
        this.row_callback_timeout = 1000;
        
        this.password_input = new password_input({"parent" : this});
        this.password_input.bind();
        
        this.series_switch = new series_switch({"parent" : this});
        this.series_switch.bind();
        
        this.load_genres = function(alias){
            
            alias = alias || '';
            
            _debug('vclub.load_genres', alias);
        
            stb.load(
                {
                    "type"      : "vod",
                    "action"    : "get_genres_by_category_alias",
                    "cat_alias" : alias
                },
                function(result){
                    _debug('callback categories');
    
                    this.sidebar.fill_items("genre", result);
                },
                this
            )
        };
        
        this.load_years = function(category_id){
            _debug('vclub.load_years');
            
            stb.load(
                {
                    "type"     : "vod",
                    "action"   : "get_years",
                    "category" : category_id
                },
                function(result){
                    _debug('callback years');
    
                    this.sidebar.fill_items("years", result);
                },
                this
            )
        };
        
        this.load_abc = function(){
            _debug('vclub.load_abc');
            
            stb.load(
                {
                    "type"   : "vod",
                    "action" : "get_abc"
                },
                function(result){
                    _debug('callback abc');
                    
                    this.sidebar.fill_items("abc", result);
                },
                this
            )
        };
        
        this._show = function(category){
            
            _debug('vclub.show');
            
            this.load_params['category'] = category.id;
            
            try{
                this.sort_menu.action();
                
                this.superclass.show.call(this);
                
                this.load_abc();
                this.load_genres(category.alias);
                this.load_years(category.id);
            }catch(e){
                _debug(e);
            }
        };
        
        /*this.show = function(category){
            
            _debug('vclub.show');
            
            this.load_params['category'] = category.id;
            
            try{
                this.sort_menu.action();
                
                this.superclass.show.call(this);
                
                this.load_abc();
                this.load_genres(category.alias);
                this.load_years(category.id);
            }catch(e){
                _debug(e);
            }
        };*/
        
        this.hide = function(do_not_reset){
            
            _debug('vclub.hide');
            
            if(!do_not_reset){
                this.search_box && this.search_box.reset && this.search_box.reset();
            }
            
            this.search_box.on && this.search_box.hide && this.search_box.hide();
            this.sort_menu.on && this.sort_menu.hide && this.sort_menu.hide();
            this.view_menu.on && this.view_menu.hide && this.view_menu.hide();
            this.other_menu.on && this.other_menu.hide && this.other_menu.hide();
            
            this.info.on && this.info.hide && this.info.hide();
            this.password_input.on && this.password_input.hide && this.password_input.hide();
            this.series_switch.on && this.series_switch.hide && this.series_switch.hide();
            
            stb.player.pause && stb.player.pause.on && stb.player.hide_pause();
            
            this.superclass.hide.call(this, do_not_reset);
        };
        
        this.init_sort_menu = function(map, options){
            this.sort_menu = new bottom_menu(this, options);
            this.sort_menu.init(map);
            this.sort_menu.bind();
        };
        
        this.sort_menu_switcher = function(){
            if (this.sort_menu && this.sort_menu.on){
                this.sort_menu.hide();
            }else{
                this.sort_menu.show();
            }
        };
        
        this.init_search_box = function(options){
            _debug('vclub.init_search_box', options);
            
            this.search_box = new search_box(this, options);
            this.search_box.init();
            this.search_box.bind();
        };
        
        this.search_box_switcher = function(){
            if (this.search_box && this.search_box.on){
                this.search_box.hide();
            }else{
                this.sidebar && this.sidebar.full_reset && this.sidebar.full_reset();
                this.search_box.show();
            }
        };
        
        this.init_view_menu = function(map, options){
            this.view_menu = new bottom_menu(this, options);
            this.view_menu.init(map);
            this.view_menu.bind();
        };
        
        this.view_switcher = function(){
            if (this.view_menu && this.view_menu.on){
                this.view_menu.hide();
            }else{
                this.view_menu.show();
            }
        };
        
        this.init_other_menu = function(map, options){
            this.other_menu = new bottom_menu(this, options);
            this.other_menu.init(map);
            this.other_menu.bind();
        };
        
        this.other_switcher = function(){
            if (this.other_menu && this.other_menu.on){
                this.other_menu.hide();
            }else{
                this.other_menu.show();
            }
        };
        
        this.fill_short_info = function(item){
            _debug('fill_short_info');
            
            //item.name
            //item.o_name
            //item.year
            //item.director
            //item.screenshot_uri
            //item.genres_str
            
            this.short_info_box.innerHTML = '<span>' + word['vclub_genre'] + ': </span>' + item.genres_str + '<br><span>' + word['vclub_year'] + ': </span>' + item.year + ' <span>' + word['vclub_length'] + ': </span>' + item.time + ' ' + word['vclub_minutes'] + '.<br><span>' + word['vclub_director'] + ': </span>' + item.director;
            this.screenshot_box.innerHTML = '<img src="' + item.screenshot_uri + '" width="240" height="320">';
        };
        
        this.init_short_info = function(){
            this.info_box = create_block_element('', this.main_container);
            
            this.short_info_box = create_block_element('vclub_info_box', this.info_box);
            this.screenshot_box = create_block_element('vclub_screenshot_box', this.info_box);
        };
        
        this.shift_row_callback = function(item){
            
            window.clearTimeout(this.row_callback_timer);
            
            var self = this;
            
            this.row_callback_timer = window.setTimeout(function(){
                
                self.fill_short_info(item);
                
            },
            this.row_callback_timeout);
        };
        
        this.set_middle_container = function(){
            
            this.superclass.set_middle_container.apply(this);
            
            this.fill_short_info(this.data_items[this.cur_row]);
            
        };
        
        this.handling_block = function(data, row_items, block_name){
        
            var passive_blocks = ['today_block', 'yesterday_block', 'week_and_more_block'];
            var active_blocks  = ['active_today_block', 'active_yesterday_block', 'active_week_and_more_block'];
            
            var block_obj = row_items[block_name+'_block'];
        
            if (data === 1){
                if (block_obj.isHidden()){
                    block_obj.show();
                }
            }else if (data === 0 || typeof(data) == "undefined"){
                if (!block_obj.isHidden()){
                    block_obj.hide();
                    
                    if (passive_blocks.indexOf(block_obj.className) >= 0 || passive_blocks.indexOf(block_obj.className) == -1){
                        row_items['name_block'].style.marginRight = '';
                    }else if (active_blocks.indexOf(block_obj.className) >= 0){
                        row_items['name_block'].style.marginRight = '25px';
                    }
                }
            }else{
                if (block_obj.isHidden()){
                    block_obj.show();
                    
                    if (passive_blocks.indexOf(block_obj.className) >= 0){
                        row_items['name_block'].style.marginRight = '103px';
                    }else if (active_blocks.indexOf(block_obj.className) >= 0){
                        row_items['name_block'].style.marginRight = '130px';
                    }else if (passive_blocks.indexOf(block_obj.className) == -1){
                        row_items['name_block'].style.marginRight = '';
                    }
                }else{
                    if (passive_blocks.indexOf(block_obj.className) >= 0){
                        row_items['name_block'].style.marginRight = '103px';
                    }else if (active_blocks.indexOf(block_obj.className) >= 0){
                        row_items['name_block'].style.marginRight = '130px';
                    }else if (passive_blocks.indexOf(block_obj.className) == -1){
                        row_items['name_block'].style.marginRight = '';
                    }
                }
                block_obj.innerHTML = data;
            }
        };
        
        this.init_info = function(){
            this.info = new vclub_info(this);
            this.info.init();
            this.info.bind();
            
            this.full_info_switch.bind(key.RIGHT, this).bind(key.INFO, this);

            var color_buttons = this.color_buttons.buttons_bar.cloneNode(true);
            
            color_buttons.addClass('disabled_all_buttons');
            
            this.info.dom_obj.appendChild(color_buttons);
        };
        
        this.full_info_switch = function(){
            _debug('full_info_switch');
            
            if (this.info && this.info.on){
                this.on = true;
                this.info.hide();
            }else{
                this.on = false;
                this.info.show(this.data_items[this.cur_row]);
            }
        };
        
        this.bind = function(){
            this.superclass.bind.apply(this);
            
            this.check_for_pass.bind(key.OK, this);
            
            (function(){
                this.hide();
                main_menu.show();
            }).bind(key.EXIT, this).bind(key.LEFT, this).bind(key.MENU, this);
        };
        
        this.check_for_pass = function(){
            _debug('vclub.check_for_play');
            
            _debug('lock', this.data_items[this.cur_row].lock);
            
            if (this.data_items[this.cur_row].lock){
                var self = this;
                
                this.password_input.callback = function(){
                    self.check_for_series();
                }
                
                this.password_input.show();
            }else{
                this.check_for_series();
            }
        };
        
        this.check_for_series = function(){
            _debug('vclub.check_for_series');
            
            if (this.data_items[this.cur_row].series.length > 0){
                
                var self = this;
                
                this.series_switch.callback = function(series){
                    _debug('series', series);
                    self.data_items[self.cur_row].cur_series = series;
                    self.play();
                }
                
                this.series_switch.show(this.data_items[this.cur_row].series, this.data_items[this.cur_row].cur_series);
            }else{
                this.play();
            }
        };
        
        this.play = function(){
            _debug('vclub.play');
            
            var self = this;
            
            _debug('cmd', this.data_items[this.cur_row].cmd);
            _debug('indexOf', this.data_items[this.cur_row].cmd.indexOf('://'));
            
            if (this.data_items[this.cur_row].cmd.indexOf('://') < 0){
            
                stb.player.on_create_link = function(result){
                    _debug('vclub.on_create_link', result);
                    
                    if (result.error == 'limit'){
                        stb.notice.show(word['player_limit_notice']);
                    }else if(result.error == 'nothing_to_play'){
                        stb.notice.show(word['player_file_missing']);
                    }else if(result.error == 'link_fault'){
                        stb.notice.show(word['player_server_error']);
                    }else{
                        if (self.info.on){
                            self.info.hide();
                        }
                        
                        self.hide(true);
                        
                        stb.player.prev_layer = self;
                        stb.player.need_show_info = 1;
                        stb.player.play_now(result.cmd);
                    }
                }
            }else{
                if (this.info.on){
                    this.info.hide();
                }
                
                this.hide(true);
                
                stb.player.prev_layer = self;
                stb.player.need_show_info = 1;
                //stb.player.play(this.data_items[this.cur_row]);
            }
            
            stb.player.play(this.data_items[this.cur_row]);
        };
        
        this.set_not_ended = function(video_id, series, end_time){
            _debug('vclub.set_not_ended', video_id, series, end_time);
            
            if (this.load_params.not_ended && empty(this.data_items[this.cur_row].series)){
                this.data_items[this.cur_row].position = end_time;
            }
            
            stb.load(
                {
                    "type"     : "vod",
                    "action"   : "set_not_ended",
                    "video_id" : video_id,
                    "series"   : series,
                    "end_time" : end_time
                },
                
                function(result){
                    
                },
                
                this
            )
        };
        
        this.add_to_fav = function(){
            _debug('vclub.add_to_fav');
            
            this.data_items[this.cur_row].fav = 1;
            
            this.map[this.cur_row].fav_block.show();
            this.active_row.fav_block.show();
            
            this.set_fav(this.data_items[this.cur_row].id);
        };
        
        this.del_from_fav = function(){
            _debug('vclub.del_from_fav');
            
            this.data_items[this.cur_row].fav = 0;
            
            this.map[this.cur_row].fav_block.hide();
            this.active_row.fav_block.hide();
            
            this.del_fav(this.data_items[this.cur_row].id);
        };
        
        this.add_del_fav = function(){
            _debug('vclub.add_del_fav');
            
            //if (this.load_params.fav == true){
            //    return;
            //}
            
            if(this.data_items[this.cur_row].fav){
                this.del_from_fav();
            }else{
                this.add_to_fav();
            }
        };
        
        this.set_fav = function(id){
            _debug('vclub.set_fav', id);
            
            stb.load(
                {
                    "type"     : "vod",
                    "action"   : "set_fav",
                    "video_id" : id
                },
                
                function(result){
                    
                }
            )
        };
        
        this.del_fav = function(id){
            _debug('vclub.del_fav', id);
            
            stb.load(
                {
                    "type"     : "vod",
                    "action"   : "del_fav",
                    "video_id" : id
                },
                
                function(result){
                    
                }
            )
        };
        
        this.sidebar_switcher = function(){
            _debug('vclub.sidebar_switcher');
            
            if (this.sidebar && !this.sidebar.on){
                this.search_box && this.search_box.reset && this.search_box.reset();
                this.load_data();
            }
            
            this.superclass.sidebar_switcher.call(this);
        };
    }
    
    vclub_constructor.prototype = new ListLayer();

    var vclub = new vclub_constructor();
        
    vclub.bind();
    vclub.init();
    
    vclub.init_short_info();
    
    vclub.set_wide_container();
    
    vclub.init_left_ear(word['ears_back']);
    vclub.init_right_ear(word['ears_about_movie']);
    
    vclub.init_color_buttons([
        {"label" : word['vclub_view'], "cmd" : vclub.view_switcher},
        {"label" : word['vclub_sort'], "cmd" : vclub.sort_menu_switcher},
        {"label" : word['vclub_fav'],  "cmd" : vclub.add_del_fav},
        {"label" : word['vclub_find'], "cmd" : vclub.other_switcher}
    ]);
    
    vclub.init_info();
    
    vclub.init_sidebar();
    
    vclub.sidebar.init_items("abc", {"header" : word['vclub_by_letter'], "width" : 26, "align" : "center"});
    vclub.sidebar.init_items("genre",  {"header" : word['vclub_by_genre'], "width" : 95});
    vclub.sidebar.init_items("years",  {"header" : word['vclub_by_year'], "width" : 35});
    
    vclub.sidebar.bind();
    
    vclub.init_sort_menu(
        [
            {"label" : word['vclub_by_addtime'], "cmd" : function(){this.parent.load_params.fav = false; this.parent.load_params.sortby = 'added'; this.parent.load_params.hd = false; this.parent.load_params.not_ended = false}},
            {"label" : word['vclub_by_title'], "cmd" : function(){this.parent.load_params.fav = false; this.parent.load_params.sortby = 'name'; this.parent.load_params.hd = false; this.parent.load_params.not_ended = false}},
            {"label" : word['vclub_top'], "cmd" : function(){this.parent.load_params.fav = false; this.parent.load_params.sortby = 'top'; this.parent.load_params.hd = false; this.parent.load_params.not_ended = false}},
            {"label" : word['vclub_only_hd'], "cmd" : function(){this.parent.load_params.sortby = 'name'; this.parent.load_params.fav = false; this.parent.load_params.hd = true; this.parent.load_params.not_ended = false}},
            {"label" : word['vclub_only_favorite'], "cmd" : function(){this.parent.load_params.sortby = 'name'; this.parent.load_params.fav = true; this.parent.load_params.hd = false; this.parent.load_params.not_ended = false}},
            {"label" : word['vclub_not_ended'], "cmd" : function(){this.parent.load_params.sortby = 'last_ended'; this.parent.load_params.fav = false; this.parent.load_params.hd = false; this.parent.load_params.not_ended = true}}
        ],
        {
            "offset_x" : 217
        }
    );
    
    vclub.init_search_box(
        {
            "offset_x"  : 323,
            "languages" : get_word('search_box_languages')
        }
    );
    
    vclub.init_view_menu(
        [
            {"label" : word['vclub_list'], "cmd" : function(){this.parent.set_wide_container()}},
            {"label" : word['vclub_list_w_info'], "cmd" : function(){this.parent.set_middle_container()}}
        ],
        {
            "offset_x" : 27,
            "need_reset_load_data" : false,
            "need_update_header"   : false
        }
    );
    
    vclub.init_other_menu(
        [
            {"label" : word['vclub_search_box'], "cmd" : function(){this.parent.search_box_switcher()}},
            {"label" : word['vclub_query_box'],  "cmd" : function(){this.parent.sidebar_switcher()}}
        ],
        {
            "offset_x" : 520,
            "need_reset_load_data" : false
        }
    );
   
    vclub.init_header_path(word['vclub_title']);
    
    vclub.sidebar.dependency    = [vclub.sort_menu, vclub.search_box, vclub.view_menu, vclub.other_menu];
    vclub.sort_menu.dependency  = [vclub.sidebar, vclub.search_box, vclub.view_menu, vclub.other_menu];
    vclub.search_box.dependency = [vclub.sidebar, vclub.sort_menu, vclub.view_menu, vclub.other_menu];
    vclub.view_menu.dependency  = [vclub.sidebar, vclub.sort_menu, vclub.search_box, vclub.other_menu];
    vclub.other_menu.dependency  = [vclub.sidebar, vclub.sort_menu, vclub.search_box, vclub.view_menu];
    
    vclub.hide();
    
    module.vclub = vclub;
    /* END VCLUB */
    
    /* Integrate vclub in main menu */
    stb.load(
        {
            "type"   : "vod",
            "action" : "get_categories"
        },
        function(result){
            _debug('callback categories');
            
            var categories = result;
            
            var map = [];
    
            for(var i=0; i<categories.length; i++){
                map.push(
                
                {
                    "title" : categories[i].title,
                    "cmd"   : (function(category){
                        
                        
                        return function(){
                            _debug('alias', category.alias);
                        
                            main_menu.hide();
                            module.vclub._show(category);
                        }
                        
                    })(categories[i])
                }
                
                );
            }
            
            main_menu.add(word['vclub_title'], map, 'i/mm_ico_video.png', '', module.vclub);
            
            loader.next();
        },
        this
    )
    
})();
