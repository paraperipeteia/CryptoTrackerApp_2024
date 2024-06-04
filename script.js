const apiUrl = 'https://api.coingecko.com/api/v3/simple/price';
const upArrow = "sprites/upArrow.png";
const downArrow = "sprites/downArrow.png";
const inRangeIcon = "sprites/inRange.png";
const fallBackSprite = "sprites/inRange.png";


var timeoutId = null;
var activeTimeout = false;
var textFile = null; 

var quotations = 
    [
        "The strongest version of the crypto industry is one that does have regulatory oversight - Sam Bankman-Fried",
        "If you don't believe it or don't get it, I don't have the time to try to convince you, sorry — Satoshi Nakamoto",
        "The computer can be used as a tool to liberate and protect people, rather than to control them — Hal Finney",
        "Not understanding blockchain, it's going to smack you down and make you bleed — Mark Cuban",
        "My crypto wallet is like an onion. When you open it, you want to cry — Anonymous",
        "There's this new cryptocurrency called Decibel. It's a sound investment — Anonymous",
        "Fiat is the ultimate shitcoin — Gun Gun Febrianza",
        "Whenever the price of cryptocurrency is rallying, people start spending a lot more - Erik Voorhees",
        "Blockrockin' chain-talkin' happy fun time — Anonymous",
        "I'm not a financial advisor, but I play one on the internet — Anonymous",
        "Use the blockchain, Luke — Anonymous",
        "The blockchain is the ultimate truth machine — Paul Brody",
        "Quantum computing is a threat to blockchain — Anonymous",
        "Satoshi Nakamoto is the most famous unknown person in the world — Anonymous",
        "Ripple is the company, XRP is the token — Anonymous",
        "p2p is the future — Anonymous",
        "Mining is the process of adding transaction records to Bitcoin's public ledger of past transactions — Anonymous",
        "The blockchain is a distributed ledger technology that underlies cryptocurrencies like Bitcoin — Anonymous",
        "Cryptocurrency is a digital or virtual form of currency that uses cryptography for security — Anonymous",
        "The blockchain is a decentralized technology spread across many computers that manages and records transactions — Anonymous",
    ];

var cyclingHeader = 
    [
        "Crypto Prices & Alerts",
        "Coinometer",
        "Coinopolis",
        "Coinocalypse",
        "Cryptocalypse",
        "Cryptometer",
        "Cryptopolis",
        "Coinucopia",
        "Coinland",
        "Coinmania",
        "Coinageddon",
        "Cryptoageddon"
    ]

var localData = { "coins" : [] };

const coinIds = ["bitcoin","siacoin","ripple","velo","algorand","cardano","stellar"];
const currencyStr = "usd";

var displayStr = "";
Refresh();
BuildForm(document.getElementById('formParent'));
BuildImportButton();
BuildExportButton();
SetFormCollapse();
CollapseForm();
SetupAbout();

function Refresh()
{
    DoFetch(BuildCoinGeckoCurrenciesString(localData), currencyStr);
    const cryptoDataDiv = document.getElementById('crypto-data');
    cryptoDataDiv.innerHTML = `${displayStr}`;

    if (activeTimeout != null)
    {
        clearTimeout(timeoutId);
        timeoutId = 0; 
        activeTimeout = false;  
    }

    timeoutId = setTimeout(Refresh, 15 * 1000);
    activeTimeout = true; 
}

function BuildCoinGeckoCurrenciesString(dataSource)
{
    var result = "";
    dataSource.coins.forEach(item =>
        {
            result += `${item.id},`
        }); 
    return result.substr(0, result.length-1); 
}

function GetStatus(item)
{
    if (item.currentPrice < item.alertThresholdLower)
    {
        return downArrow;
    }
    else if (item.currentPrice > item.alertThresholdHigher)
    {
        return upArrow;
    }
    return inRangeIcon; 
}

function DoFetch(ids, currencies)
{
    var totalOwnedValue = 0; 
    var current = 0;

    if (ids.length == 0)
    {
        console.log("No ids to fetch");
        return; 
    }

    fetch(`${apiUrl}?ids=${ids}&vs_currencies=${currencies}`)
        .then(response => response.json())
        .then(data => 
            {
                localData.coins.forEach(item => 
                    {
                        item.currentPrice = data[item.id][currencies];
                        var cssClass = item.currentPrice > item.alertThresholdHigher || item.currentPrice < item.alertThresholdLower ? "alertWidget" : "widget";
                        var statusImg = GetStatus(item); 
                        var coinName = item.name;
                        var img = `<img src=${item.icon} id ="typeIcon">`;

                        if (current == 0)
                        {
                            displayStr =`<div class="${cssClass}" id="${item.id}">${img} ${coinName}: $${item.currentPrice.toFixed(4)} USD`;
                        }
                        else
                        {
                            displayStr +=`<div class="${cssClass}" id="${item.id}">${img} ${coinName}: $${item.currentPrice.toFixed(4)} USD`;
                        }
                        current++; 
                        displayStr += ` <img src ="${statusImg}">`;
                        displayStr += `<br> Owned: ${item.amountOwned}`;
                        var valueOwned = item.amountOwned * item.currentPrice;
                        totalOwnedValue += valueOwned;
                        displayStr += `<br>Value $${valueOwned.toFixed(2)}`;
                        displayStr += `</div></div>`;
                    });

                const dDiv = document.getElementById('crypto-data'); 
                dDiv.innerHTML = displayStr; 

                const topHeader = document.getElementById('topHeader');
                var cycledHeader = cyclingHeader[Math.floor(Math.random() * cyclingHeader.length)];

                topHeader.innerHTML = `${cycledHeader} | Total Value: $${totalOwnedValue.toFixed(2)} USD`;

                var date = new Date(Date.now()); 
                var minutes = date.getMinutes();
                var seconds = date.getSeconds(); 
                minutes =  minutes < 10 ? `${0}${minutes}` : minutes;
                seconds = seconds < 10 ? `${0}${seconds}` : seconds;
                var timestamp = `${date.getHours()}:${minutes}:${seconds}`;

                topHeader.innerHTML += ` | Pulled @ ${timestamp}`;

                const btmHeader = document.getElementById('bottomHeader');
                var selectedQuote = quotations[Math.floor(Math.random() * quotations.length)];
                AnimatedText(selectedQuote, btmHeader);

                localData.coins.forEach(item => 
                    {
                        var btn = document.getElementById(`btn_${item.id}`);
                        if (btn === null) return;


                        btn.addEventListener('click', function() 
                            {
                                const link = document.createElement("a");
                                const content = JSON.stringify(localData.coins);
                                const file = new Blob([content], { type: 'text/plain' });
                                link.href = URL.createObjectURL(file);
                                link.download = "sample.txt";
                                link.click();
                                URL.revokeObjectURL(link.href);
                            });
                    });

            }).catch(error => {
                console.error('Error fetching data:', error);});
}

function MakeTextFile(text)
{
    var d =  new Blob([text], {type: 'text/plain'}); 

    if (textFile != null)
    {
        window.URL.revokeObjectURL(textFile); 
    }

    textFile = window.URL.createObjectURL(d); 
    return textFile; 
}

function FetchOwnedCoinData()
{
    fetch(`./data.json`)
        .then((res) => {
            if (!res.ok) {
                throw new Error
                (`Could not fetch`);
            }
            return res.json();
        })
        .then((data) => 
            console.log(data))
            .catch((error) => 
                console.error("Unable to fetch data:", error));
}

function AddCoin(newCoinId, owned, low, high, newCoinName, icon)
{
    var newCoinEntry = 
        {
            "id" : `${newCoinId}`,
            "amountOwned" : owned,
            "alertThresholdLower" : low,
            "alertThresholdHigher" : high,
            "currentPrice" : 0.0,
            "name" : `${newCoinName}`,
            "icon" : `${icon}`
        }
    localData.coins.push(newCoinEntry);
}

function BuildExportButton()
{
    const btn = document.getElementById('exportHeader');
    btn.addEventListener('click', function() 
        {
            console.log("Exporting data");
            const link = document.createElement("a");
            var content = JSON.stringify(localData.coins, null, "\t");

            // Wrap content in braces and add key.
            content = `{"coins" : ${content}}`;
            const file = new Blob([content], { type: 'application/json' });

            link.href = URL.createObjectURL(file);
            link.download = "tokenData.json";
            link.click();

            URL.revokeObjectURL(link.href);
        });
}

function BuildImportButton()
{
    var importButtonInjection = `<div class="file-input custom"><span>Select Import File</span><input type="file" id="my_file" placeholder="TEST"></div>`;/*</div>`;*/
    document.getElementById("importingParent").innerHTML += importButtonInjection;

    document.getElementById('importHeader').onclick = function() 
    {
        var file = document.getElementById('my_file').files[0];

        if (file == null)
        {
            console.log("No file selected");
            PrintErrorMsgOnHeader("importHeader", "No file selected");
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) 
        {
            var contents = e.target.result;
            console.log(`Imported contents: ${contents}`);
            ProcessImportedData(contents);
        }
        reader.readAsText(file);
    }
}

function BuildForm(targetParent)
{
    var coinInput = "";
    coinInput += "<form>";

    var labels = ["newCoinId", "amount owned", "low-alert threshold", "high-alert threshold", "coinName", "icon (path to sprite)"];

    var labelValues = 
        {
            "id" : "string", 
            "amount owned" : "numeric", 
            "low-alert threshold" : "numeric", 
            "high-alert threshold" : "numeric", 
            "name" : "string", 
            "icon (path to sprite)" : "string"
        }

    labels.forEach(item =>
        {
            coinInput += `<label id="formLabel" for="${item}">${item}:</label><br>`;
            coinInput += `<input type="text" id="${item}" name ="${name}"><br>`; 
        });

    coinInput += "</form>";
    coinInput += `<button onclick id="submitBtn" class="button">Add Token</button>`;
    targetParent.innerHTML = coinInput;

    var newCoinId, newCoinName, path = ""; 
    var owned, low, high, currentPrice = 0;

    var btn = document.getElementById("submitBtn").addEventListener('click', function() 
        {
            labels.forEach(item => 
                {
                    const val = document.getElementById(item);

                    if (val.id == "newCoinId")
                    {
                        newCoinId = val.value; 
                    }
                    else if (val.id == "amount owned")
                    {
                        owned = val.value; 
                    }
                    else if (val.id == "low-alert threshold")
                    {
                        low = val.value;
                    }
                    else if (val.id == "high-alert threshold")
                    {
                        high = val.value;
                    }
                    else if (val.id == "coinName")
                    {
                        newCoinName = val.value;
                    }
                    else 
                    {
                        path = val.value;
                    }
                });
            AddCoin(newCoinId, owned, low, high, newCoinName, path);

            PrintErrorMsgOnHeader("tknHeader", "Adding Token...", "Hide Token Form");            
            Refresh();
        });
}

function CollapseElement(id, msgElementId, msg)
{
    var element = document.getElementById(id);
    element.style.display = "none";
    document.getElementById(msgElementId).innerHTML = `${msg}`;
}

function ExpandElement(id, msgElementId, msg)
{
    var element = document.getElementById(id);
    element.style.display = "inline-block";
    document.getElementById(msgElementId).innerHTML = `${msg}`;
}


function CollapseForm()
{
    var form = document.getElementById("formParent");
    form.style.display = "none";
    document.getElementById("tknHeader").innerHTML = "Add Token";
}

function ExpandForm()
{
    var form = document.getElementById("formParent");
    form.style.display = "inline-block";
    document.getElementById("tknHeader").innerHTML = "Hide Token Form";
}

function SetFormCollapse()
{
    document.getElementById('tknHeader').addEventListener('click', function()
        {
            var form = document.getElementById('formParent');

            if (form.style.display == "none")
            {
                ExpandForm();
            }
            else
            {
                CollapseForm();
            }
        });
}

function ProcessImportedData(data)
{
    console.log("Processing imported data");
    var jsonData = JSON.parse(data);
    console.log(jsonData);
    if (IsDataValid(jsonData))
    {
        PrintErrorMsgOnHeader("importHeader", "Importing...", "Import Data");
        console.log("Data is valid");
        localData.coins = [];
        jsonData.coins.forEach(item => 
            {
                if (!localData.coins.includes(item.id, localData.coins.id))
                {
                    AddCoin(item.id, item.amountOwned, item.alertThresholdLower, item.alertThresholdHigher, item.name, item.icon);
                }
            });
        Refresh();
    }
}

function PrintErrorMsgOnHeader(elementId, msg, revertMsg)
{
    var elem = document.getElementById(`${elementId}`);
    let bgClr = window.getComputedStyle(elem).backgroundColor;
    elem.style.backgroundColor = "red";
    elem.style.fontWeight = "bold";
    elem.innerHTML = msg;

    setTimeout(function(bgClr) 
        {
            elem.style.backgroundColor = `rgba(0, 120, 200, 0.4)`;
            elem.style.fontWeight = "normal";
            elem.innerHTML = revertMsg;
        }, 1000);
}

function IsDataValid(data)
{

    if (data.coins == null)
    {
        console.log("Data is null");
        PrintErrorMsgOnHeader("importHeader", "Data is null", "Import Data");
        return false;
    }

    data.coins.forEach(item => 
        {
            if (item.id == null || item.amountOwned == null 
                || item.alertThresholdLower == null 
                || item.alertThresholdHigher == null 
                || item.currentPrice == null 
                || item.name == null 
                || item.icon == null)
            {
                PrintErrorMsgOnHeader("importHeader", "Data is invalid");
                return false; 
            }
        });
    return true;
}

function SetupAbout()
{
    var aboutText = `This web application fetches cryptocurrency data from the CoinGecko API every 15 seconds. The data is displayed in an easiy readable format and can be exported and imported. The application is built using HTML, CSS, and JavaScript. The data is stored in a local JSON object and can be exported and imported`;

    var aboutCoinGecko = `The CoinGecko API is a free API that provides cryptocurrency data. The API is easy to use and provides a wide range of data. Please refer to CoinGecko documentation for more information on how to setup your own custom coin list using correct coin ids.`;

    var coinGeckoLink = `<a href="https://docs.coingecko.com/reference/coins-list" target="_blank">CoinGecko Coins List API Documentation</a>`;

    var aboutDiv = document.getElementById("aboutParent"); 
    aboutDiv.innerHTML = aboutText;
    aboutDiv.innerHTML += `<br><br>`;
    aboutDiv.innerHTML += aboutCoinGecko;
    aboutDiv.innerHTML += `<br><br>`;
    aboutDiv.innerHTML += coinGeckoLink;
    CollapseElement("aboutParent", "aboutHeader","About")

    document.getElementById("aboutHeader").addEventListener('click', function()
        {
            var aboutDiv = document.getElementById("aboutParent");
            if (aboutDiv.style.display == "none")
            {
                ExpandElement("aboutParent", "aboutHeader", "Hide About");
            }
            else
            {
                CollapseElement("aboutParent", "aboutHeader","About");
            }
        });
}

function typeWriter(txt, targ, position) 
{
    var speed = 60;
    // safety to make sure we don't end up with a bunch of weird junk - bug fix 
    targ.innerHTML = `${txt.substring(0, position)}`;
    if (position < txt.length) 
    {
        targ.innerHTML += txt.charAt(position);
        position++;
        setTimeout(() => 
            {
                typeWriter(txt, targ, position);
            }, speed);
    }
}

function AnimatedText(text, target)
{
    target.innerHTML = "";
    typeWriter(text, target, 0); 
}

function FlashAllText()
{
    var text = document.getElementById("animatedText");
    text.style.color = "red";
    setTimeout(function() 
        {
            text.style.color = "black";
        }, 1000);
}

function AnimateElement(id)
{
    var element = document.getElementById(id);
    if (element == null)
    {
        document.createElement(id);
        element.style.animation = "bounce 0.5s 1";
    }
}
