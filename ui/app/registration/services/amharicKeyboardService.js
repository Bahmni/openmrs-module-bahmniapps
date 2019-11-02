'use strict';

angular.module('bahmni.registration')
    .factory('amharicKeyboardService', function () {
        var store = "";
        var amharicConverter = function (scope, element, ngModel, event) {
            var oneCharacter = {
                "a": "12A5", "A": "12D5", "b": "1265", "B": "1265", "c": "127D", "C": "132D", "d": "12F5", "D": "12F5",
                "f": "134D", "F": "134D", "g": "130D", "G": "130D", "h": "1205", "H": "1215", "j": "1305", "J": "1305",
                "k": "12AD", "K": "12BD", "l": "120D", "L": "120D", "m": "121D", "M": "121D", "n": "1295", "N": "129D",
                "p": "1355", "P": "1335", "q": "1245", "Q": "1245", "r": "122D", "R": "122D", "s": "1235", "S": "1225",
                "t": "1275", "T": "1325", "v": "126D", "V": "126D", "w": "12CD", "W": "12CD", "x": "123D", "X": "123D",
                "y": "12ED", "Y": "12ED", "z": "12DD", "Z": "12E5", "~": "1345", "#": "133D", ":": "1361", ",": "1363",
                ";": "1364"
            };
            var twoCharacter = {
                ae: "12A0", aE: "12A0", au: "12A1", aU: "12A1", ai: "12A2", aI: "12A2", aa: "12A5", aA: "12A5", ao: "12A6", aO: "12A6", Ae: "12D0", AE: "12D0", Au: "12D1", AU: "12D1", Ai: "12D2", AI: "12D2", Aa: "12D3", Ao: "12D6", AO: "12D6", be: "1260", bu: "1261", bi: "1262", ba: "1263", bo: "1266", bE: "1260", bU: "1261", bI: "1262", bO: "1266", BE: "1260", BU: "1261", BI: "1262", BA: "1263", BO: "1266", Be: "1260", Bu: "1261", Bi: "1262", Ba: "1263", Bo: "1266", ce: "1278", cu: "1279", ci: "127A", ca: "127B", co: "127E", cE: "1278", cU: "1279", cI: "127A", cO: "127E", Ce: "1328", Cu: "1329", Ci: "132A",
                Ca: "132B", Co: "132E", CE: "1328", CU: "1329", CI: "132A", CO: "132E", de: "12F0", du: "12F1", di: "12F2", da: "12F3", "do": "12F6", dE: "12F0", dU: "12F1", dI: "12F2", dO: "12F6", DE: "12F0", DU: "12F1", DI: "12F2", DO: "12F6", De: "12F0", Du: "12F1", Di: "12F2", Da: "12F3", Do: "12F6", Ea: "12A7", fe: "1348", fu: "1349", fi: "134A", fa: "134B", fo: "134E", fE: "1348", fU: "1349", fI: "134A", fO: "134E", FE: "1348", FU: "1349", FI: "134A", FO: "134E", Fe: "1348", Fu: "1349", Fi: "134A", Fa: "134B", Fo: "134E", ge: "1308", gu: "1309", gi: "130A", ga: "130B", go: "130E", gE: "1308", gU: "1309",
                gI: "130A", gO: "130E", GE: "1308", GU: "1309", GI: "130A", GO: "130E", Ge: "1308", Gu: "1309", Gi: "130A", Ga: "130B", Go: "130E", he: "1200", hu: "1201", hi: "1202", ha: "1203", ho: "1206", hE: "1200", hU: "1201", hI: "1202", hO: "1206", He: "1210", Hu: "1211", Hi: "1212", Ha: "1213", Ho: "1216", HE: "1210", HU: "1211", HI: "1212", HO: "1216", je: "1300", ju: "1301", ji: "1302", ja: "1303", jo: "1306", jE: "1300", jU: "1301", jI: "1302", jO: "1306", JE: "1300", JU: "1301", JI: "1302", JO: "1306", Je: "1300", Ju: "1301", Ji: "1302", Ja: "1303", Jo: "1306", ke: "12A8", ku: "12A9", ki: "12AA", ka: "12AB",
                ko: "12AE", kE: "12A8", kU: "12A9", kI: "12AA", kO: "12AE", Ke: "12B8", Ku: "12B9", Ki: "12BA", Ka: "12BB", Ko: "12BE", KE: "12B8", KU: "12B9", KI: "12BA", KO: "12BE", le: "1208", lu: "1209", li: "120A", la: "120B", lo: "120E", lE: "1208", lU: "1209", lI: "120A", lO: "120E", LE: "1208", LU: "1209", LI: "120A", LA: "120B", LO: "120E", Le: "1208", Lu: "1209", Li: "120A", La: "120B", Lo: "120E", me: "1218", mu: "1219", mi: "121A", ma: "121B", mo: "121E", mE: "1218", mU: "1219", mI: "121A", mO: "121E", ME: "1218", MU: "1219", MI: "121A", MO: "121E", Me: "1218", Mu: "1219", Mi: "121A", Ma: "121B", Mo: "121E",
                ne: "1290", nu: "1291", ni: "1292", na: "1293", no: "1296", nE: "1290", nU: "1291", nI: "1292", nO: "1296", Ne: "1298", Nu: "1299", Ni: "129A", Na: "129B", No: "129E", NE: "1298", NU: "1299", NI: "129A", NO: "129E", pe: "1350", pu: "1351", pi: "1352", pa: "1353", po: "1356", pE: "1350", pU: "1351", pI: "1352", pO: "1356", Pe: "1330", Pu: "1331", Pi: "1332", Pa: "1333", Po: "1336", PE: "1330", PU: "1331", PI: "1332", PO: "1336", qe: "1240", qu: "1241", qi: "1242", qa: "1243", qo: "1246", qE: "1240", qU: "1241", qI: "1242", qO: "1246", QE: "1240", QU: "1241", QI: "1242", QO: "1246", Qe: "1240", Qu: "1241",
                Qi: "1242", Qa: "1243", Qo: "1246", re: "1228", ru: "1229", ri: "122A", ra: "122B", ro: "122E", rE: "1228", rU: "1229", rI: "122A", rO: "122E", RE: "1228", RU: "1229", RI: "122A", RO: "122E", Re: "1228", Ru: "1229", Ri: "122A", Ra: "122B", Ro: "122E", se: "1230", su: "1231", si: "1232", sa: "1233", so: "1236", sE: "1230", sU: "1231", sI: "1232", sO: "1236", Se: "1220", Su: "1221", Si: "1222", Sa: "1223", So: "1226", SE: "1220", SU: "1221", SI: "1222", SO: "1226", te: "1270", tu: "1271", ti: "1272", ta: "1273", to: "1276", tE: "1270", tU: "1271", tI: "1272", tO: "1276", Te: "1320", Tu: "1321", Ti: "1322",
                Ta: "1323", To: "1326", TE: "1320", TU: "1321", TI: "1322", TO: "1326", ve: "1268", vu: "1269", vi: "126A", va: "126B", vo: "126E", vE: "1268", vU: "1269", vI: "126A", vO: "126E", VE: "1268", VU: "1269", VI: "126A", VO: "126E", Ve: "1268", Vu: "1269", Vi: "126A", Va: "126B", Vo: "126E", we: "12C8", wu: "12C9", wi: "12CA", wa: "12CB", wo: "12CE", wE: "12C8", wU: "12C9", wI: "12CA", wO: "12CE", WE: "12C8", WU: "12C9", WI: "12CA", WO: "12CE", We: "12C8", Wu: "12C9", Wi: "12CA", Wa: "12CB", Wo: "12CE", xe: "1238", xu: "1239", xi: "123A", xa: "123B", xo: "123E", xE: "1238", xU: "1239", xI: "123A", xO: "123E",
                XE: "1238", XU: "1239", XI: "123A", XO: "123E", Xe: "1238", Xu: "1239", Xi: "123A", Xa: "123B", Xo: "123E", ye: "12E8", yu: "12E9", yi: "12EA", ya: "12EB", yo: "12EE", yE: "12E8", yU: "12E9", yI: "12EA", yO: "12EE", YE: "12E8", YU: "12E9", YI: "12EA", YO: "12EE", Ye: "12E8", Yu: "12E9", Yi: "12EA", Ya: "12EB", Yo: "12EE", ze: "12D8", zu: "12D9", zi: "12DA", zo: "12DE", zE: "12D8", zU: "12D9", zI: "12DA", za: "12DB", zO: "12DE", Ze: "12E0", Zu: "12E1", Zi: "12E2", Za: "12E3", Zo: "12E6", ZE: "12E0", ZU: "12E1", ZI: "12E2", ZO: "12E6", "~e": "1340", "~u": "1341", "~i": "1342", "~a": "1343",
                "~o": "1346", "~E": "1340", "~U": "1341", "~I": "1342", "~O": "1346", "#e": "1338", "#u": "1339", "#i": "133A", "#a": "133B", "#o": "133E", "#E": "1338", "#U": "1339", "#I": "133A", "#O": "133E"
            };
            var threeCharacter = {
                "aee": "12A4", "aEE": "12A4", "aEe": "12A4", "aeE": "12A4", "Aee": "12D4", "AEE": "12D4", "AEe": "12D4", "AeE": "12D4", "hee": "1204", "hEE": "1204", "hEe": "1204", "heE": "1204", "Hee": "1214", "HEE": "1214", "HEe": "1214", "HeE": "1214", "lee": "120C", "lEE": "120C", "LEE": "120C", "lEe": "120C", "leE": "120C", "LeE": "120C", "LEe": "120C", "mee": "121C", "mEE": "121C", "MEE": "121C", "mEe": "121C", "meE": "121C", "MeE": "121C", "MEe": "121C", "see": "1234", "sEE": "1234", "sEe": "1234", "seE": "1234", "See": "1224", "SEE": "1224", "SEe": "1224", "SeE": "1224",
                "ree": "122C", "rEE": "122C", "rEe": "122C", "reE": "122C", "REE": "122C", "REe": "122C", "ReE": "122C", "xee": "123C", "xEE": "123C", "xEe": "123C", "xeE": "123C", "XEE": "123C", "XEe": "123C", "XeE": "123C", "qee": "1244", "qEE": "1244", "qEe": "1244", "qeE": "1244", "QEE": "1244", "QEe": "1244", "QeE": "1244", "bee": "1264", "bEE": "1264", "bEe": "1264", "beE": "1264", "BEE": "1264", "BEe": "1264", "BeE": "1264", "vee": "126C", "vEE": "126C", "vEe": "126C", "veE": "126C", "VEE": "126C", "VEe": "126C", "VeE": "126C", "tee": "1274", "tEE": "1274", "tEe": "1274", "teE": "1274",
                "Tee": "1324", "TEE": "1324", "TEe": "1324", "TeE": "1324", "cee": "127C", "cEE": "127C", "cEe": "127C", "ceE": "127C", "Cee": "132C", "CEE": "132C", "CEe": "132C", "CeE": "132C", "nee": "1294", "nEE": "1294", "nEe": "1294", "neE": "1294", "Nee": "129C", "NEE": "129C", "NEe": "129C", "NeE": "129C", "kee": "12AC", "kEE": "12AC", "kEe": "12AC", "keE": "12AC", "Kee": "12BC", "KEE": "12BC", "KEe": "12BC", "KeE": "12BC", "wee": "12CC", "wEE": "12CC", "wEe": "12CC", "weE": "12CC", "WEE": "12CC", "WEe": "12CC", "WeE": "12CC", "zee": "12DC", "zEE": "12DC", "zEe": "12DC", "zeE": "12DC",
                "Zee": "12E4", "ZEE": "12E4", "ZEe": "12E4", "ZeE": "12E4", "yee": "12EC", "yEE": "12EC", "yEe": "12EC", "yeE": "12EC", "YEE": "12EC", "YEe": "12EC", "YeE": "12EC", "dee": "12F4", "dEE": "12F4", "dEe": "12F4", "deE": "12F4", "DEE": "12F4", "DEe": "12F4", "DeE": "12F4", "jee": "1304", "jEe": "1304", "jeE": "1304", "JEE": "1304", "JEe": "1304", "JeE": "1304", "gee": "130C", "gEE": "130C", "gEe": "130C", "geE": "130C", "GEE": "130C", "GEe": "130C", "GeE": "130C", "fee": "134C", "fEE": "134C", "fEe": "134C", "feE": "134C", "FEE": "134C", "FEe": "134C", "FeE": "134C", "pee": "1354",
                "pEE": "1354", "pEe": "1354", "peE": "1354", "Pee": "1334", "PEE": "1334", "PEe": "1334", "PeE": "1334", "~ee": "1344", "~EE": "1344", "~Ee": "1344", "~eE": "1344", "#ee": "133C", "#EE": "133C", "#Ee": "133C", "#eE": "133C", "Hua": "1217", "HUa": "1217", "HUA": "1217", "lua": "120F", "lUA": "120F", "lUa": "120F", "LUA": "120F", "LUa": "120F", "LuA": "120F", "rua": "122F", "Rua": "122F", "rUa": "122F", "ruA": "122F", "RUa": "122F", "RUA": "122F", "xua": "123F", "xUa": "123F", "xUA": "123F", "XUa": "123F", "XUA": "123F", "Sua": "1227", "SUA": "1227", "SuA": "1227", "sua": "1237",
                "sUA": "1237", "suA": "1237", "bua": "1267", "bUa": "1267", "BUA": "1267", "buA": "1267", "Bua": "1267", "vua": "126F", "VUA": "126F", "cua": "127F", "cUA": "127F", "hua": "128B", "hUA": "128B", "hue": "1283", "HUE": "1283", "HUI": "1285", "hui": "1285", "nua": "1297", "nUA": "1297", "Nua": "129F", "NUA": "129F", "Zua": "12E7", "ZUA": "12E7", "zua": "12DF", "zUA": "12DF", "dua": "12F7", "dUA": "12F7", "DUA": "12F7", "jua": "1307", "jUA": "1307", "JUA": "1307", "Cua": "132F", "CUA": "132F", "fua": "134F", "FUA": "134F", "fUA": "134F", "Pua": "1337", "PUA": "1337", "pua": "1357", "pUA": "1357", "#ua": "133F",
                "#UA": "133F", "tua": "1277", "tUA": "1277", "kua": "12B3", "kUA": "12B3", "qua": "124B", "QUA": "124B", "gua": "130F", "gUA": "130F", "GUA": "130F", "mua": "121F", "MUA": "121F", "mUA": "121F", "Tua": "1327", "TUA": "1327"
            };

            var insertTextAtCursor = function (el, text, replace) {
                var val = el.value, endIndex, range;
                if (typeof el.selectionStart != "undefined" && typeof el.selectionEnd != "undefined") {
                    endIndex = el.selectionEnd;
                    if (replace) {
                        el.value = val.slice(0, el.selectionStart - 1) + text + val.slice(endIndex);
                        el.selectionStart = el.selectionEnd = (endIndex + text.length) - 1;
                    }
                    else {
                        el.value = val.slice(0, el.selectionStart) + text + val.slice(endIndex);
                        el.selectionStart = el.selectionEnd = endIndex + text.length;
                    }
                } else if (typeof document.selection != "undefined" && typeof document.selection.createRange != "undefined") {
                    el.focus();
                    range = document.selection.createRange();
                    range.collapse(false);
                    range.text = text;
                    range.select();
                }

              /*  el.value = text; */
            };
            var getTextBeforeCursor = function (el) {
                var val = el.value, endIndex, range;
                var text;
                if (typeof el.selectionStart != "undefined" && typeof el.selectionEnd != "undefined") {
                    endIndex = el.selectionEnd;
                    text = val.slice(0, el.selectionStart);
                }
                return text;
            };
            var testTirgum = function (tirgum) {
                if (tirgum) {
                    return /^[A-F\d]{4}$/.test(tirgum);
                }
                else {
                    return false;
                }
            };
            var getHohe = function (tirgum) {
                var uni = '"\\u' + tirgum + '"';
                var hohe = eval(uni); // eslint-disable-line no-eval
                if (hohe === "undefined") {
                    hohe = eval(uni); // eslint-disable-line no-eval
                }
                return hohe;
            };
            var appendWithReplace = function (hohe) {
                insertTextAtCursor(element[0], hohe, true);
            };
            var appendHohe = function (hohe) {
                insertTextAtCursor(element[0], hohe, false);
            };

            var appendWithSadisCheck = function (hohe) {
                var isSadis = isLastCharSadis();
                var ea = convertCharStr2Unicode(hohe);
                if (isSadis && ea && ea !== "U+12A5") {
                    insertTextAtCursor(element[0], hohe, true);
                }
            };

            // for html keyboard use
            var replaceLastCharacter = function (alphabet) {
                var text = getTextBeforeCursor(element[0]);
                if (text) {
                    var lastChar = text.substring(text.length - 1);
                    var code = convertCharStr2Unicode(lastChar);
                    if (code && code.length > 5) {
                        var endsWith = code.substring(code.length - 1);
                        var startsWith = code.substring(2, code.length - 1);
                        if (endsWith === "5" || endsWith === "D" || endsWith === "1" || endsWith === "9") {
                            if (alphabet) {
                                anababi = alphabet.toLowerCase();
                                var tirgum;
                                var hohe;
                                if (alphabet === "a") {
                                    if (endsWith === "5") {
                                        tirgum = startsWith + "3";
                                    }
                                    if (endsWith === "D") {
                                        tirgum = startsWith + "B";
                                    }
                                    if (endsWith === "1") {
                                        tirgum = startsWith + "7";
                                        if (code === "U+1241") { // ቁ
                                            tirgum = startsWith + "B";
                                        }
                                    }
                                    if (endsWith === "9") {
                                        tirgum = startsWith + "F";
                                    }
                                    hohe = getHohe(tirgum);
                                }
                                else if (anababi === "e") {
                                    tirgum = startsWith + "0";
                                    if (endsWith === "D") {
                                        tirgum = startsWith + "8";
                                    }
                                    hohe = getHohe(tirgum);
                                }
                                else if (anababi === "u") {
                                    tirgum = startsWith + "1";
                                    if (endsWith === "D") {
                                        tirgum = startsWith + "9";
                                    }
                                    hohe = getHohe(tirgum);
                                }
                                else if (anababi === "i") {
                                    tirgum = startsWith + "2";
                                    if (endsWith === "D") {
                                        tirgum = startsWith + "A";
                                    }
                                    hohe = getHohe(tirgum);
                                }
                                else if (anababi === "o") {
                                    tirgum = startsWith + "6";
                                    if (endsWith === "D") {
                                        tirgum = startsWith + "E";
                                    }
                                    hohe = getHohe(tirgum);
                                }
                                if (hohe && hohe.length > 0) {
                                    appendWithReplace(hohe);
                                }
                            }
                        }
                        else if (endsWith === "0" || endsWith === "8") {
                            var tirgum = startsWith + "4";
                            if (endsWith === "8") {
                                tirgum = startsWith + "C";
                            }
                            var hohe = getHohe(tirgum);
                            if (hohe) {
                                appendWithReplace(hohe);
                            }
                        }
                    }
                    else {
                        var hohe = getHohe(code);
                        if (hohe) {
                            appendHohe(hohe);
                        }
                    }
                }
            };
            var isLastCharSadis = function () {
                var sadis = false;
                var text = getTextBeforeCursor(element[0]);
                if (text) {
                    var lastChar = text.substring(text.length - 1);
                    var code = convertCharStr2Unicode(lastChar);
                    if (code && code.length > 5) {
                        var endsWith = code.substring(code.length - 1);
                        sadis = endsWith === "5" || endsWith === "D";
                    }
                }
                return sadis;
            };
            var isLastCharGeez = function () {
                var geez = false;
                var text = getTextBeforeCursor(element[0]);
                if (text) {
                    var lastChar = text.substring(text.length - 1);
                    var code = convertCharStr2Unicode(lastChar);
                    if (code && code.length > 5) {
                        var endsWith = code.substring(code.length - 1);
                        geez = endsWith === "0" || endsWith === "8";
                    }
                }
                return geez;
            };
            var isLastCharKei = function () {
                var geez = false;
                var text = getTextBeforeCursor(element[0]);
                if (text) {
                    var lastChar = text.substring(text.length - 1);
                    var code = convertCharStr2Unicode(lastChar);
                    if (code && code.length > 5) {
                        var endsWith = code.substring(code.length - 1);
                        geez = endsWith === "1" || endsWith === "9";
                    }
                }
                return geez;
            };

            /* function convertCharStr2Unicode
            Copyright (C) 2007  Richard Ishida ishida@w3.org
            This program is free software; you can redistribute it and/or modify it under the terms
            of the GNU General Public License as published by the Free Software Foundation; either
            version 2 of the License, or (at your option) any later version as long as you point to
            http://rishida.net/ in your code. */

            var convertCharStr2Unicode = function (textString, preserve, pad) {
                // converts a string of characters to U+... notation, separated by space
                // textString: string, the string to convert
                // preserve: string enum [ascii, latin1], a set of characters to not convert
                // pad: boolean, if true, hex numbers lower than 1000 are padded with zeros
                var haut = 0;
                var n = 0;
                var CPstring = ''; pad = false;
                for (var i = 0; i < textString.length; i++) {
                    var b = textString.charCodeAt(i);
                    if (b < 0 || b > 0xFFFF) {
                        CPstring += 'Error in convertChar2CP: byte out of range ' + dec2hex(b) + '!';
                    }
                    if (haut != 0) {
                        if (b >= 0xDC00 && b <= 0xDFFF) {
                            CPstring += 'U+' + dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)) + ' ';
                            haut = 0;
                            continue;
                        }
                        else {
                            CPstring += 'Error in convertChar2CP: surrogate out of range ' + dec2hex(haut) + '!';
                            haut = 0;
                        }
                    }
                    if (b >= 0xD800 && b <= 0xDBFF) {
                        haut = b;
                    }
                    else {
                        if (b <= 127 && preserve == 'ascii') {
                            CPstring += textString.charAt(i) + ' ';
                        }
                        else if (b <= 255 && preserve == 'latin1') {
                            CPstring += textString.charAt(i) + ' ';
                        }
                        else {
                            var cp = dec2hex(b);
                            if (pad) {
                                while (cp.length < 4) { cp = '0' + cp; }
                            }
                            CPstring += 'U+' + cp + ' ';
                        }
                    }
                }
                return CPstring.substring(0, CPstring.length - 1);
            };
            var dec2hex = function (textString) {
                return (textString + 0).toString(16).toUpperCase();
            };

            var letter = String.fromCharCode(event.which);
            var word;
            if (event.which != 32) {
                store = store + letter;
            }
            else {
                store = "";
            }

            if (event.which == 13) {
                store = "";
            }

            word = store;
            if (word.length > 0) {
                var num = "";
                var uni = "";
                if (word.length == 3) {
                    num = threeCharacter[word];
                    // if word has no meaning e.g. "tab" "mos" "tae"
                    if (num) {
                        if (testTirgum(num)) {
                            var hohe = getHohe(num);
                            appendWithReplace(hohe);
                            store = "";
                        }
                    }
                    else {
                        // e.g word "sea" if "tae" t-ae ? ta-e
                        var thirdChar = word.charAt(2);
                        var firstChar = word.charAt(0);
                        var firstTwo = word.charAt(0) + word.charAt(1);
                        var lastTwo = word.charAt(1) + word.charAt(2);
                        var tirgum;
                        if (thirdChar == "a" || thirdChar == "e"
                            || thirdChar == "i" || thirdChar == "o"
                            || thirdChar == "u" || thirdChar == "A"
                            || thirdChar == "E" || thirdChar == "I"
                            || thirdChar == "O" || thirdChar == "U") {
                            tirgum = oneCharacter[thirdChar];
                            if (lastTwo.toLowerCase() === "ae" || tirgum === "undefined") {
                                tirgum = oneCharacter[firstChar];
                                if (testTirgum(tirgum)) {
                                    var hohe = getHohe(tirgum);
                                    appendWithReplace(hohe);
                                    store = lastTwo;
                                    tirgum = twoCharacter[lastTwo];
                                    var hohe = getHohe(tirgum);
                                    appendHohe(hohe);
                                }
                            }
                            else {
                                if (testTirgum(tirgum)) {
                                    var hohe = getHohe(tirgum);
                                    appendHohe(hohe);
                                }
                                store = word.charAt(2);
                            }
                        }
                        else {
                            store = word.charAt(2);
                            tirgum = oneCharacter[word.charAt(2)]; // checkOne(word.charAt(2));
                            if (testTirgum(tirgum)) {
                                var hohe = getHohe(tirgum);
                                appendHohe(hohe);
                            }
                            else {
                                store = "";
                            }
                        }
                    }
                }
                else if (word.length == 2) {
                    num = twoCharacter[word]; // checkTwo(word);
                    // if word is like "hh" function returns ""
                    if (num) {
                        tirgum = twoCharacter[word]; // checkTwo(word);
                        var lastChar = word.charAt(1);
                        if (testTirgum(tirgum)) {
                            var hohe = getHohe(tirgum);
                            appendWithSadisCheck(hohe);
                        }
                    } else {
                        var tirgum;
                        store = word.charAt(1);
                        tirgum = oneCharacter[word.charAt(1)]; // checkOne(word.charAt(1));

                        if (testTirgum(tirgum)) {
                            var hohe = getHohe(tirgum);
                            appendHohe(hohe);
                        }
                        else {
                            store = "";
                        }
                    }
                }
                else {
                    if (word === "E") {
                        word = "Ea";
                        tirgum = twoCharacter[word]; // checkTwo(word);
                    } else {
                        tirgum = oneCharacter[word]; // checkOne(word);
                    }
                    if (testTirgum(tirgum)) {
                        var hohe = getHohe(tirgum);
                        appendHohe(hohe);
                    }
                }
            }

            // ignore english characters ":", ";", ",", "#"
            if (event.which == 58 || event.which == 59 || event.which == 44 || event.which == 35 || event.which == 126) {
                return false;
            }
            if (event.which > 64 && event.which < 123
                && event.which != 91 && event.which != 92
                && event.which != 93 && event.which != 94
                && event.which != 95 && event.which != 96) {
                scope.$apply(function () {
                    ngModel.$setViewValue(element[0].value);
                });
                return false;
            }
            return false;
        };
        return {
            amharicConverter: amharicConverter
        };
    });
