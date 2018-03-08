
                //-----------------------------------------------------richiesta api crossref------------------------------------------------------------------//
                function getCrossref(title, dataz)
                {
                    var url = "https://api.crossref.org/works?query.title=" + title + "&sort=score&order=desc";
                    $.ajax({
                        type: "GET",
                        url: url,
                        async: "false",
                        dataType: "json",
                        success: function (data)
                        {
                        
                        //creo il bottone dropdown per crossref
                            $('#output #myCarousel2').after('<button id="crossref" type="button" class="btn btn-outline-dark" data-toggle="collapse" data-target="#uno">Crossref</button><div id="uno" class="collapse"><div class="card card-block"><div id="crossdiv" class="container"><p>Books, Articles and other metadata from Crossref:</p></div></div></div>');
                            for(i in data['message']['items'])
                            {   
                                if (data['message']['items'][i].score >= 22)
                                {
                                    $('#crossdiv').append('<div id=card'+i+' class="card card-body bg-light"></div><br>');
                                    
                                    var anno_pub = data['message']['items'][i]['indexed']['date-parts'][0];
                                    var editore = data['message']['items'][i].publisher;
                                    var tipo = data['message']['items'][i].type;
                                    var titolo = data['message']['items'][i].title;
                                    var doi = data['message']['items'][i].DOI;
                                    var link = data['message']['items'][i].URL;
                                    var isbn = data['message']['items'][i]['ISBN'];
                                    
                                    if (titolo)
                                    {
                                        $('div [id=card'+i+']').append('<p>titolo: <code><a href="'+link+'">'+titolo+'</a></code></p>');
                                    }
                                    if (data['message']['items'][i]['author'])
                                    {
                                        $('div [id=card'+i+']').append('<p id=auth'+i+'>autore: </p>');
                                        for (var p in data['message']['items'][i]['author'])
                                        {
                                            $('#auth'+i).append('<code>'+data['message']['items'][i]['author'][p].given+' '+data['message']['items'][i]['author'][p].family+'</code>');
                                        } 
                                    }
                                    if (editore)
                                    {
                                        $('div [id=card'+i+']').append('<p>editore: <code>'+editore+'</code></p>');
                                    }
                                    if (anno_pub)
                                    {
                                        $('div [id=card'+i+']').append('<p>anno pubblicazione: <code>'+anno_pub+'</code></p>');
                                    }
                                    if (doi)
                                    {
                                        $('div [id=card'+i+']').append('<p>doi: <code>'+doi+'</code></p>');
                                    }
                                    if (isbn)
                                    {
                                        $('div [id=card'+i+']').append('<p>isbn: <code>'+isbn+'</code></p>');
                                    }
                                    
                                    if (tipo)
                                    {
                                        $('div [id=card'+i+']').append('<p>tipo: <code>'+tipo+'</code></p>');
                                    }
                                }
                            }
                            InitAnnotator(dataz);
                        },
                        error: function() 
                        {
                            alert('Error: getCrossref');
                        }
                    });
                }
                //---------------------------------------------------FINE richiesta corssref-----------------------------------------------------------------------//






                //---------------------------------------------------Inizializzazione Annotator--------------------------------------------------------------------//
                var displayNameExtension = function (viewer) {
                    function updateViewer(field, annotation) {
                        field = $(field);
                        if(annotation.user){
                            field.html("author: <span style='color: teal; font-weight: bold;'>"+annotation.user+"</span>");
                        }
                        else{
                            field.remove();
                        }
                    }
                    viewer.addField({
                        load: updateViewer
                    });
                };

                function InitAnnotator(data)
                {
                    console.log('init annotator');
                    var user = $('a[id="userMenu"]').text();
                    if (!user)
                    {
                        user = null;
                    }
                    var pageTitle = data.parse.title;
                    var pageRevisionId = data.parse.revid;
                    var pageId = data.parse.pageid;
                    
                    var app = new annotator.App()
                    
                    /* select element to annotate and add extension */
                    
                    .include(annotator.ui.main, {
                       element: document.querySelector("body"), 
                       editorExtensions: [annotator.ui.tags.editorExtension],
                       viewerExtensions: [ displayNameExtension, annotator.ui.tags.viewerExtension ]
                    })
        
                    /* storage */
                    app.include(annotator.storage.http, { prefix: 'http://marullo.cs.unibo.it:8000/annotator'});
        
                    app.include(function() {
                       return {
                          beforeAnnotationCreated: function(ann){
                             ann.page_id= pageId;
                             ann.revision_id = pageRevisionId;
                             ann.page_title=pageTitle;
                          }
                       } 
                    });
                    /* start return a promise, load loads annotations from the storage*/
                    app.start().then(function(){
                        console.log('load annotations');
                       app.annotations.load({page_id:pageId, revision_id:pageRevisionId});
                       if(user){
                          /* identity of the current user */
                          app.ident.identity = user.trim();
                       }                        
                    });
                    //$("li.annotator-checkbox.annotator-item").css("display","block !important");
                    $('li[class="annotator-item annotator-checkbox"] input[id="annotator-field-3"]').prop('checked', false);
                    $('li[class="annotator-item annotator-checkbox"] input[id="annotator-field-3"]').remove();
                    $('li[class="annotator-item annotator-checkbox"] label[for="annotator-field-3"]').remove();
                }
                //---------------------------------------------------FINE Inizializzazione Annotator--------------------------------------------------------------------//





                //------------------------------------------------funzione richiesta wiki-PAGE-----------------------------------------------------------------//
                function getWikiPage(title, mode)
                {
                    $("#output").empty();

                    var action = 'page';

                    if (mode == 'revid')
                    {
                        action = 'oldid'
                    }
                    
                    var titolo = title;
                    titleURI = encodeURIComponent(title);
                    var url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&'+action+'=' + titleURI +'&callback=?';
                    //alert(title);
                    $.ajax({
                        type: "GET",
                        url: url,
                        //async: "false",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function(data) 
                        {
                            $("#output").append(data['parse']['text']['*']);
                            var revid = data['parse']['revid'];
                            clean(data['parse']['title'], revid);
                            is_crossref(title, data);
                        },
                        error: function() 
                        {
                            alert('Error: getWikiPage');
                        }
                    });
                }

                //--------------------------------------------------------FINE wiki-page------------------------------------------------------------------------------------//
        


                //---------------------------------------------------"pulizia" pagina di wiki-----------------------------------------------------------------------//

                function clean(pag_title, revid)
                {
                    console.log('clean page');
                    var tab = 0;
                    //ridireziono i link
                    $('#output').find('a').each(function () {
                        if ($(this).parents('.toc').length || $(this).parents('.reference').length || $(this).hasClass('external text')
        || $(this).hasClass('image'))
                        {
                            if ($(this).hasClass('image')) {$(this).removeAttr("href"); $(this).attr("target", "blank_");}
                        }
                        else {
                            /*
                            $(this).removeAttr("href");
                            $(this).attr('tabindex', tab);
                            $(this).attr('class', 'pseudo_link');
                            $(this).attr("onclick", "getWikiPage(\""+$(this).attr("title")+"\")");                            
                            $(this).attr("role", "button");
                            */
                            var p_n = $(this).text();
                            $(this).attr('href', 'http://marullo.cs.unibo.it:8000/home/search:'+p_n);
                            $(this).attr('class', 'pseudo_link');
                        }
                        tab++;
                    });
        
                    //pulizia, elimino parti indesiderate della pagina
                    $('#output .mw-editsection').remove();
                    $('#output .navbox').remove();
                    $('#output .mbox-small.plainlinks.sistersitebox').remove();
                    $('#output .hatnote.navigation-not-searchable').remove();
                    $('#output .infobox.vevent').removeAttr('style');
                    $('#output table[role="presentation\"]').remove();
                    $('#output table[class="infobox\"]').remove();
                    $('#output table[class="infobox vevent\"]').remove();
                    $('#output table[class="infobox vcard\"]').remove();
                    $('#output tbody').remove();

                    //page menu
                    

                    $('#output').prepend('<div id="wiki-page"></div>');


                    //contenuto pagina wiki
                    
                    $('.mw-parser-output').attr('id', 'wiki-content');
                    $('div[id="wiki-content"]').appendTo('#wiki-page');

                    //div che conterrà il page menu
                    $('<div id="sidebar"></div>').prependTo('#output #wiki-page');

                    //sposto il page menu nel nuovo div
                    $('div[id="toc"]').appendTo('div[id="sidebar"]');

                    if ($('div[id="toc"]').length == 0)
                    {
                        $("#sidebar").css({"top": "unset", "position":"unset","height":"unset","width":"unset","overflow":"unset"});
                        $("#wiki-content").css({"position":"relative", "margin-left":"0px","margin-top":"0px"});
        
                    }

                    $('div[id="toc"] ul').unwrap();
                    
                    //$('#sidebar ul').attr('class', 'nav nav-pills flex-column');
                    //$('#sidebar #toc').attr('class', 'sidebar-sticky');
                    //$('#sidebar ul li').attr('class', 'nav-item');
                    //$('#sidebar ul').attr('class', 'nav');
                    //$('#sidebar ul li a').attr('class', 'nav-link');

                    /*$('#sidebar ul li').find('a').each(function () 
                    {
                        //var numb = $(this, '.tocnumber').text();
                        var text = $(this, '.toctext').text();
                        console.log(text);
                        //$(this).append(numb);
                        $(this).append(text);
                        //$(this, 'span[class"tocnumber"]').remove();
                        //$(this, 'span[class"toctext"]').remove();
                       
                    });
                    $('#sidebar ul li span[class="toctext"]').remove();
                    $('#sidebar ul li span[class="tocnumber"]').remove();
                    */
                    

                    

                    /*
                    $('.toctitle').remove();
                    $("div[id='pagemenu\']").remove(); //rimuovo il menu della pagina vecchia, nel caso io richieda una nuova pagina mentre ne ho già caricata una
                    $('<li id=menu class="nav-item"></li>').appendTo("ul[class='navbar-nav mr-auto\']");
                    $('<div id=pagemenu class=dropdown></div>').appendTo("li[id='menu\']");
                    $('<a data-toggle="dropdown" href="#" class="nav-link">Page Menu</a>').appendTo("div[id='pagemenu\']");
                    $('#toc ul').addClass('dropdown-menu');
                    $('#toc ul').appendTo("div[id='pagemenu\']");
                    */
                  
                    //creazione slide immagini
                    $('#output').prepend('<div id="myCarousel2" class="carousel slide" data-ride="carousel"><div class="carousel-inner"></div></div>');
                    $('#output #myCarousel2').append('<a class="carousel-control-prev" href="#myCarousel2" role=button data-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a><a class="carousel-control-next" href="#myCarousel2" role="button" data-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a></div>');

                    //metto le immagini dentro allo slider
                    var j=0;
                    var q=0;
                    var text1;
                    $('#output .thumbinner').each(function ()
                    {
                        if (j == 0)
                        {
                            //creazione item attivo
                            j=1;
                            $('#output .carousel-inner').prepend('<div class="carousel-item active"></div>');
                            $(this).find('img').prependTo('.carousel-inner .carousel-item.active');
                            //$(this,'.image img').prependTo('.carousel-inner .carousel-item.active');
                            $('<span class="img_text"></span>'/*+ $(this).find('.thumbcaption')+'</span>'*/).prependTo('.carousel-inner .carousel-item.active');
                            
                            $(this).find('.thumbcaption').appendTo('#output .img_text');
                            //$(this,'.thumbcaption').appendTo('#output .img_text');
                            //$('#output .thumbinner .thumbcaption a').attr('class', 'img_link');
                        }

                        else 
                        {       
                            //altri item
                            
                            $('#output .carousel-inner').append('<div id=item-'+q+' class="carousel-item"></div>');
                            $(this).find('img').prependTo('.carousel-inner #item-'+q);

                            $('<span class="img_text"></span>').prependTo('.carousel-inner #item-'+q);
                            $(this).find('.thumbcaption').appendTo('#output .carousel-inner #item-'+q+' .img_text');
                        }
                        q = q+1; 
                    });
                    
                    
                    //inserisco immagini della gallery
                    $('#output .gallerybox').each(function ()
                    {
                        $('#output .carousel-inner').append('<div id=item-'+q+' class="carousel-item"></div>');
                        $(this).find('img').prependTo('.carousel-inner #item-'+q);
                        text1 = $(this).find('.gallerytext').text();
                        $('<span class="img_text">'+text1+'</span>').prependTo('.carousel-inner #item-'+q);;
                        q = q+1;
                    });
                    
                    //rimuovo le gallery
                    $('#output .gallerybox').remove();
                    $("span[id*='Gallery\']").remove();
                    $("ul[class*='gallery mw-gallery-traditional\']").remove();                                            
                    $("div[class*='thumb tleft\']").remove();
                    $("div[class*='thumb tright\']").remove();

                    //stile pagina
                    $('#main').empty();
                    $("#main").append('<h1>'+pag_title+'</h1>');
                    $("#main").append('<p>Current revid: '+revid+'</p><p>If you look for a specific page revision go to /home/revid:your_revid </p>');
                }  

                 //---------------------------------------------------FINE "pulizia" pagina di wiki-----------------------------------------------------------------------//

        
        
                    //-----------------------------------------------funzione richiesta wiki-CATEGORY--------------------------------------------------------//
                function req_wiki_category (string, seed) {
                    var url =
        "https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:"+string+"&cmlimit=100&cmsort=sortkey&format=json&callback=?";         
                      $.ajax({
                        url: url,
                        type: "GET",
                        async: false,
                        dataType: "jsonp",
                        success: function(data)
                        {
                          
                            var i = 0;
                            var ar = new Array();
                            var len = seed.length - 11;
                            var true_seed = seed.substring(0, len);
                            //var true_seed = "March 8, 2018,";
                            console.log(true_seed);
                            Math.seedrandom(true_seed);
                            for(i; i<21; i++) 
                            {   
                                //funzione per avere elementi random sulla home
                                var item = data['query']['categorymembers'][Math.floor(Math.random()*data['query']['categorymembers'].length)];

                                if(jQuery.inArray(item.title, ar) != -1)
                                {
                                    while(jQuery.inArray(item.title, ar) != -1)
                                    {
                                        item = data['query']['categorymembers'][Math.floor(Math.random()*data['query']['categorymembers'].length)];
                                    }
                                }
                                else {
                                    ar.push(item.title);
                                }
                                
                                $('#categories').append('<div class="col-lg-4"><img id="img'+i+'" class="rounded-circle" width="140" height="140"><h2>'+item.title+'</h2><p><a class="btn btn-secondary" id="cat_btn" name="'+item.title+'" href="http://marullo.cs.unibo.it:8000/home/search:'+item.title+'" role="button">View page &raquo;</a></p></div>');   
                                get_img_title(item.title,item.pageid, i);
                            }
                        },
                        error: function() 
                        {
                            alert('Error: req_wiki_category');
                        }
                      });
                  } 
            //---------------------------------------------------------------FINE wiki-category-----------------------------------------------------------------------------------//


            //------------------------------------------------------------richiesta titolo immagine----------------------------------------------------------------------------//
            function get_img_title(string, pageid, index)
            {
                $.ajax({
                    url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles="+string,

                    type: "GET",

                    async: false,

                    dataType: "jsonp",

                    success: function(data)
                    {      
                            if (pageid == 0)
                            {
                                var id = +Object.keys(data['query']['pages']);
                                pageid=id;
                            }

                            var p = 0; 
                            //alert('get title '+index);
                            if ((data['query']['pages'][pageid]['images'])==null)
                            {
                                get_img_url('no', index);
                            }
                            for (var j in data['query']['pages'][pageid]['images'])
                            {
                                //filtro le immagini stock di wikipedia
                                if ((data['query']['pages'][pageid]['images'][j].title == 'File:Commons-logo.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Question book-new.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Symbol book class2.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Commons-logo.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Wiki letter w.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Ambox important.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Text document with red question mark.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Wikiquote-logo.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Nuvola apps package graphics.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:P literature.svg') || (data['query']['pages'][pageid]['images'][j].title == 'File:Nuvola apps package graphics.png'))
                                {
                                    
                                }
                                else 
                                {
                                    get_img_url(data['query']['pages'][pageid]['images'][j].title, index);
                                }
                            }                        
                            get_img_url('no', index);
                    },
                    error: function() 
                    {
                        console.log('Error get_img_title');
                    }                        
                  }); 
            }
            //------------------------------------------------------------FINE richiesta titolo immagine----------------------------------------------------------------------------//



            //------------------------------------------------------------------richiesta url immagine-------------------------------------------------------------------------------//
            function get_img_url(string, numb)
            {
                if (string == 'no')
                {
                    $('#categories img[id="img'+numb+'"]').attr('src', 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg');
                }
                else {

                $.ajax({
                    url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles="+string+"&iiprop=url",

                    type: "GET",

                    async: false,

                    dataType: "jsonp",

                    success: function(data)
                    {   
                        //alert('url value=  '+Object.keys(data['query']['pages']));
                        var pagid = +Object.keys(data['query']['pages']);
                        
                        $('#categories img[id="img'+numb+'"]').attr('src', data['query']['pages'][pagid]['imageinfo'][0].url);  
                    },
                    error: function() 
                    {
                        console.log('Error get_img_url');
                    }
                  });  
                }
            }
            //------------------------------------------------------------------FINE richiesta url immagine-------------------------------------------------------------------------------//




            //---------------------------------------------------------controllo se la pagina deve avere crossref-----------------------------------------------------------------//
            function is_crossref(string, data1)
            {
                $.ajax({
                    url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=categories&titles="+string,

                    type: "GET",

                    async: false,

                    dataType: "jsonp",

                    success: function(data)
                    {   
                        var found = 0;
                        var pagid = +Object.keys(data['query']['pages']);
                        for ( var i in data['query']['pages'][pagid]['categories'])
                        {
                            if (data['query']['pages'][pagid]['categories'][i].title == 'Category:Art movements')
                            {
                                found = 1;
                                break;
                            }
                        }
                        if (found == 1)
                        {
                            getCrossref(string, data1)
                        }
                        else {
                            InitAnnotator(data1);
                        }    
                    },
                    error: function() 
                    {
                       console.log('Error is_crossref');
                    }
                  });  
            }
            //---------------------------------------------------FINE controllo crossref-----------------------------------------------------------------------------------------------//




        //-----------------------------------------------------------------funzione OPEN SEARCH wiki-------------------------------------------------------------------------//
        function req_wiki_search (string) {
                  var url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+ string +"&limit=21&format=json&callback=?";
                  $.ajax({
                    url: url,
                    type: "GET",
                    async: false,
                    dataType: "json",
                    success: function(data)
                    {
                      if ((data[1][0])==null)
                      {
                        $('#categories').append('<p>Nessun risultato trovato ...</p>');
                      }
                      for(var i = 0; i < data[1].length; i++) {

                        $('#categories').append('<div class="col-lg-4"><img id="img'+i+'" class="rounded-circle" width="140" height="140"><h2>'+data[1][i]+'</h2><p><a class="btn btn-secondary" id="cat_btn" name="'+data[1][i]+'" href="http://marullo.cs.unibo.it:8000/home/search:'+data[1][i]+'" role="button">View page &raquo;</a></p></div>');   
                        get_img_title(data[1][i], 0, i);
                      }
                    },
                    error: function() 
                    {
                       console.log('Error req_wiki_search');
                    }
                  });
            }
            //------------------------------------------FINE open search wiki---------------------------------------------------------------------------------------------------------

        
                           
                
        
               
