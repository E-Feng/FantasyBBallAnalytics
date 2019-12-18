function getTemplateByID(str) {
  let templates = $("template");
  for (let i=0; i<templates.length; i++) {
    if (templates[i].id == str) {
      return templates[i];
    }
  }
}

function getTeamNameByID(id) {
  return json_data["team_data"].find(o => o.id==id)["team_name"];
}

function addNewProperty(data, row, col, prop) {
  // Function to add new css property to google charts data
  old_prop = data.getProperties(row, col);
  if (old_prop["className"]) {
    new_prop = old_prop["className"] + " " + prop;
  } else {
    new_prop = prop;
  }
  data.setProperty(row, col, "className", new_prop);
}

function getColumnIndex(str) {
  // Function to get column index from string header name
  header_keys = Object.keys(matchup_headers);
  for (let i = 0; i < header_keys.length; i++) {
    if (str == header_keys[i]) {
      return i;
    }
  }
}

function getColorValue(val) {
  // Function to get color value for standings table
  val = val > 2 ? 2 : val;
  let h = Math.floor((2 - val) * 60) + 10;
  let s = 100;
  let l = 70;

  return HSLToHex(h, s, l);
}

function HSLToHex(h, s, l) {
  // Function to convert HSL color to hex
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs((h / 60) % 2 - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}