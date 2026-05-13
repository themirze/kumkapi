<script>
  // Dark gTm - Fetch API Tracker
  // Transport Type: Fetch API (ES5 Compatible)
  // Add this to GTM as Custom HTML tag
  // Trigger: All Pages
  
  (function() {
    'use strict';
    
    if (window.darkGtmFetchTrackerInstalled) return;
    window.darkGtmFetchTrackerInstalled = true;
    
    console.log('Dark gTm: Fetch API tracker initialized');
    
    // Helper: Check if URL is tracking/ads (not form services)
    function isSecurityCheck(url) {
      var urlLower = String(url).toLowerCase();
      return urlLower.indexOf('recaptcha') > -1 ||
             urlLower.indexOf('turnstile') > -1 ||
             urlLower.indexOf('hcaptcha') > -1 ||
             urlLower.indexOf('captcha') > -1 ||
             urlLower.indexOf('google-analytics') > -1 ||
             urlLower.indexOf('googleadservices') > -1 ||
             urlLower.indexOf('doubleclick') > -1 ||
             urlLower.indexOf('facebook.com/tr') > -1 ||
             urlLower.indexOf('facebook.com/plugins') > -1 ||
             urlLower.indexOf('/collect?') > -1 ||
             urlLower.indexOf('/g/collect') > -1 ||
             urlLower.indexOf('/j/collect') > -1 ||
             urlLower.indexOf('/r/collect') > -1 ||
             urlLower.indexOf('stats.') > -1 ||
             urlLower.indexOf('adservice') > -1 ||
             urlLower.indexOf('ad.') > -1 ||
             urlLower.indexOf('.ads.') > -1;
    }
    
    // Helper: Extract POST data
    function extractPostData(body) {
      var data = {};
      try {
        if (body instanceof FormData) {
          var entries = body.entries();
          var entry = entries.next();
          
          while (!entry.done) {
            var key = entry.value[0];
            var value = entry.value[1];
            var keyLower = key.toLowerCase();
            
            if (keyLower.indexOf('csrf') === -1 && 
                keyLower.indexOf('password') === -1 &&
                keyLower.indexOf('token') === -1) {
              
              if (keyLower.indexOf('email') > -1 ||
                  keyLower.indexOf('phone') > -1 ||
                  keyLower.indexOf('name') > -1 ||
                  keyLower.indexOf('message') > -1) {
                data[key] = value;
              }
            }
            entry = entries.next();
          }
        } else if (typeof body === 'string') {
          var params = new URLSearchParams(body);
          var entries2 = params.entries();
          var entry2 = entries2.next();
          
          while (!entry2.done) {
            var key2 = entry2.value[0];
            var value2 = entry2.value[1];
            var keyLower2 = key2.toLowerCase();
            
            if (keyLower2.indexOf('csrf') === -1 && 
                keyLower2.indexOf('password') === -1 &&
                keyLower2.indexOf('token') === -1) {
              
              if (keyLower2.indexOf('email') > -1 ||
                  keyLower2.indexOf('phone') > -1 ||
                  keyLower2.indexOf('name') > -1 ||
                  keyLower2.indexOf('message') > -1) {
                data[key2] = value2;
              }
            }
            entry2 = entries2.next();
          }
        }
      } catch (e) {}
      return data;
    }
    
    // Helper: Push to dataLayer
    function pushFormEvent(eventData) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'dark_gtm',
        'eventCategory': 'Form',
        'eventAction': 'Submit',
        'eventLabel': eventData.url,
        'formUrl': eventData.url,
        'formMethod': eventData.method || 'POST',
        'formStatus': eventData.status || 200,
        'formTransport': eventData.transport,
        'formDuration': eventData.duration,
        'formData': eventData.formData || {},
        'formId': eventData.formId || '',
        'pageUrl': window.location.href,
        'timestamp': Date.now(),
        'nonInteraction': false
      });
      
      console.log('Dark gTm: Form submitted', eventData);
    }
    
    // Fetch API Patch
    var origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = function(input, init) {
        var start = performance.now();
        var url = (typeof input === 'string') ? input : (input && input.url) ? input.url : '';
        var method = (init && init.method) || 'GET';
        method = String(method).toUpperCase();
        
        var isFormPost = method === 'POST' && init && init.body;
        
        // Skip security checks
        if (isFormPost && isSecurityCheck(url)) {
          console.log('Dark gTm: Skipped security check', url);
          return origFetch.apply(this, arguments);
        }
        
        return origFetch.apply(this, arguments).then(function(res) {
          var duration = Math.round(performance.now() - start);
          
          // Accept both success (2xx) and redirects (3xx) - forms often redirect after submit
          var isSuccess = res && (res.ok || (res.status >= 300 && res.status < 400));
          
          if (isFormPost && isSuccess) {
            var formData = extractPostData(init.body);
            
            pushFormEvent({
              url: url,
              method: method,
              transport: 'fetch',
              duration: duration,
              formData: formData,
              status: res.status
            });
          }
          
          return res;
        });
      };
    }
  })();
</script>
