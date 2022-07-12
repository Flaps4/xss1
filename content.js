function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
//Every copy item stands for 1 button and makes it possible to call eventlistener to the extensions html code.
// Items for sentienl querys
  var copyUnfamiliarBtn = document.querySelector('.js-copy-unfamiliar-btn'),
    copyDownloadBtn = document.querySelector('.js-copy-download-btn'),
    copyPwresetBtn = document.querySelector('.js-copy-pwreset-btn'),
    copyFulluserBtn = document.querySelector('.js-copy-fulluser-btn'),
    copyIpdataBtn = document.querySelector('.js-copy-ipdata-btn'),
    copyPasstenantBtn = document.querySelector('.js-copy-passtenant-btn');
    copyAuditlogsBtn = document.querySelector('.js-copy-auditlogs-btn');

    // Items for mcas querys
    copyMcassigninlogsBtn = document.querySelector('.js-copy-mcassigninlogs-btn');
    copyLegitcheckBtn = document.querySelector('.js-copy-legticheck-btn');
    
//Sentinel querys
//(\r\n is for breaks)

  copyUnfamiliarBtn.addEventListener('click', function(event) {
    copyTextToClipboard('SigninLogs\r\n\| where UserPrincipalName contains "nameofperson"\r\n|project  AppDisplayName,UserPrincipalName, Location, ResultType,UserAgent,IPAddress,ResultDescription,AuthenticationDetails,AuthenticationMethodsUsed,ClientAppUsed');
  });
  
  
  copyDownloadBtn.addEventListener('click', function(event) {
    copyTextToClipboard('OfficeActivity\r\n| search "nameonuser"\r\n| where Operation contains "FileDownload/recycle "\r\n| project UserAgent, Operation, TimeGenerated, OfficeObjectId, UserType, ItemType');
  });

  copyPwresetBtn.addEventListener('click', function(event) {
    copyTextToClipboard('AuditLogs\r\n| search "Name"\r\n| where OperationName "Password reset"\r\n| project TimeGenerated, OperationName, ResultDescription,InitiatedBy, Result, ResultReason');
  });

  copyFulluserBtn.addEventListener('click', function(event) {
    copyTextToClipboard('search "name"\r\n| summarize count() by $table');
  });
  
  copyIpdataBtn.addEventListener('click', function(event) {
    copyTextToClipboard('search "Ip"\r\n| summarize count() by $table');
  });

  copyPasstenantBtn.addEventListener('click', function(event) {
    copyTextToClipboard('let timeframe = 7d;\r\nlet action = dynamic(["change ", "changed ", "reset "]);\r\nlet pWord = dynamic(["password ", "credentials "]);\r\n(union isfuzzy=true\r\n(SecurityEvent\r\n| where TimeGenerated >= ago(timeframe)\r\n| where EventID in (4723,4724)\r\n| summarize StartTimeUtc = min(TimeGenerated), EndTimeUtc = max(TimeGenerated), ResultDescriptions = makeset(Activity), ActionCount = count() by Resource = Computer, OperationName = strcat("TargetAccount: ", TargetUserName), UserId = Account, Type\r\n),\r\n(AuditLogs\r\n| where TimeGenerated >= ago(timeframe)\r\n| where OperationName has_any (pWord) and OperationName has_any (action)\r\n| extend InitiatedBy = tostring(parse_json(tostring(InitiatedBy.user)).userPrincipalName)\r\n| extend TargetUserPrincipalName = tostring(TargetResources[0].userPrincipalName)\r\n| where ResultDescription != "None"\r\n| summarize StartTimeUtc = min(TimeGenerated), EndTimeUtc = max(TimeGenerated), ResultDescriptions = makeset(ResultDescription), CorrelationIds = makeset(CorrelationId), ActionCount = count() by OperationName = strcat(Category, " - ", OperationName, " - ", Result), Resource, UserId = TargetUserPrincipalName, Type\r\n| extend ResultDescriptions = tostring(ResultDescriptions)\r\n),\r\n(OfficeActivity\r\n| where TimeGenerated >= ago(timeframe)\r\n| where (ExtendedProperties has_any (pWord) or ModifiedProperties has_any (pWord)) and (ExtendedProperties has_any (action) or ModifiedProperties has_any (action))\r\n| extend ResultDescriptions = case(\r\nOfficeWorkload =~ "AzureActiveDirectory", tostring(ExtendedProperties),\r\nOfficeWorkload has_any ("Exchange","OneDrive"), OfficeObjectId,\r\nRecordType)\r\n| summarize StartTimeUtc = min(TimeGenerated), EndTimeUtc = max(TimeGenerated), ResultDescriptions = makeset(ResultDescriptions), ActionCount = count() by Resource = OfficeWorkload, OperationName = strcat(Operation, " - ", ResultStatus), IPAddress = ClientIP, UserId, Type\r\n),\r\n(Syslog\r\n| where TimeGenerated >= ago(timeframe)\r\n| where SyslogMessage has_any (pWord) and SyslogMessage has_any (action)\r\n| summarize StartTimeUtc = min(TimeGenerated), EndTimeUtc = max(TimeGenerated), ResultDescriptions = makeset(SyslogMessage), ActionCount = count() by Resource = HostName, OperationName = Facility , IPAddress = HostIP, ProcessName, Type\r\n),\r\n(SigninLogs\r\n| where TimeGenerated >= ago(timeframe)\r\n| where OperationName =~ "Sign-in activity" and ResultType has_any ("50125", "50133")\r\n| summarize StartTimeUtc = min(TimeGenerated), EndTimeUtc = max(TimeGenerated), ResultDescriptions = makeset(ResultDescription), CorrelationIds = makeset(CorrelationId), ActionCount = count() by Resource, OperationName = strcat(OperationName, " - ", ResultType), IPAddress, UserId = UserPrincipalName, Type\r\n)\r\n)\r\n| extend timestamp = StartTimeUtc, AccountCustomEntity = UserId, IPCustomEntity = IPAddress');
  });

  copyAuditlogsBtn.addEventListener('click', function(event) {
    copyTextToClipboard('AuditLogs\r\n|search "NAME"\r\n| where OperationName contains "Password reset"\r\n| project TimeGenerated, OperationName, ResultDescription,InitiatedBy, Result, ResultReason');
  });

//MCAS QUERYS

  copyMcassigninlogsBtn.addEventListener('click', function(event) {
    copyTextToClipboard('AADSignInEventsBeta\r\n| where AccountUpn contains "NAMN"\r\n| summarize count() by IPAddress, Application, ErrorCode, ResourceDisplayName, AuthenticationRequirement, Country, DeviceName,  NetworkLocationDetails');
  });

  copyLegitcheckBtn.addEventListener('click', function(event) {
    copyTextToClipboard('DeviceInfo\r\n| where DeviceName contains "nameofdevice"\r\n| where Timestamp < ago(3d)\r\n| project PublicIP');
  });

 

function Start()
{
    var username = document.getElementById("username").value;
    

    window.open("https://urlscan.io/");
}

  


