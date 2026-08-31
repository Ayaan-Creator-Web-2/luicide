function doGet(e) {
  var targetUrl = e.parameter.url;
  if (!targetUrl) return ContentService.createTextOutput("Error: No URL provided.");

  try {
    var response = UrlFetchApp.fetch(targetUrl, { followRedirects: true, muteHttpExceptions: true });
    var html = response.getContentText();
    var scriptUrl = ScriptApp.getService().getUrl();
    var domainMatch = targetUrl.match(/^https?:\/\/[^\/]+/);
    var domain = domainMatch ? domainMatch : "";

    var rewrittenHtml = html.replace(/(href|src)=["']([^"']+)["']/g, function(match, attr, val) {
      if (val.startsWith("mailto:") || val.startsWith("javascript:") || val.startsWith("#")) return match;
      
      var fullUrl = val;
      if (val.startsWith("//")) {
        fullUrl = "https:" + val;
      } else if (val.startsWith("/")) {
        fullUrl = domain + val;
      } else if (!val.startsWith("http")) {
        var base = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);
        fullUrl = base + val;
      }

      if (attr === "href") {
        return 'href="' + scriptUrl + '?url=' + encodeURIComponent(fullUrl) + '"';
      } else {
        return 'src="' + fullUrl + '"';
      }
    });

    return HtmlService.createHtmlOutput(rewrittenHtml)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return HtmlService.createHtmlOutput("Proxy Error: " + err.toString())
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}
