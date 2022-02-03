// original code in Python Copyright Miklos Vajna (ged2dot@vmiklos.hu) 2022.
// translated to JavaScript by Anton Davydov (git@fetsorn.website).
// This file is licensed under the Mozilla Public License, v. 2.0.
// License text available at https://mozilla.org/MPL/2.0/

class Config {
  constructor() {
        this.input = ""
        this.rootfamily = "F1"
        this.familydepth = 4
        this.nameorder = "little"
  }
}

class DotExport {
  constructor() {
    this.subgraph = []
    this.config = {}
  }

  store_individual_nodes(stream) {
    for (var i in this.subgraph) {
      var node = this.subgraph[i]
      if (! (node instanceof Individual)) {
        continue
      }
      stream += node.dict["identifier"] + " [shape=box\n"
      var name_order = this.config.nameorder
      var label = node.get_label(name_order)
      stream += "label = <" + label + ">\n"
      stream += "tooltip = \"" + node.dict["identifier"] + "\"\n"
      stream += "color = " + node.get_color() + "];\n"
    }
    return stream
  }

  store_family_nodes(stream) {
    stream += "\n"
    for (var i in this.subgraph) {
      var node = this.subgraph[i]
      if (! (node instanceof Family)) {
        continue
      }
      var table_start = "<table border=\"0\" cellborder=\"0\" width=\"16px\" height=\"10px\">"
      var label = table_start + "<tr><td></td></tr></table>"

      if (node.dict["marr"]) {
        label = node.dict["marr"]
      }
      stream += node.dict["identifier"] + " [shape=circle\n"
      stream += "style=filled, color=black, fillcolor=white\n"
      stream += "href=\"javascript:setRoot('" + node.dict["identifier"] + "')\"\n"
      stream += "label=<" + label + ">, tooltip=\"" + node.dict["identifier"] + "\"];\n"
    }
    stream += "\n"
    return stream
  }

  store_edges(stream) {
    for (var i in this.subgraph) {
      var node = this.subgraph[i]
      if (! (node instanceof Family)) {
        continue
      }
      if (node.wife) {
        var from_wife = node.wife.dict["identifier"] + " -> " + node.dict["identifier"] + " [dir=none];\n"
        stream += from_wife
      }
      if (node.husb) {
        var from_husb = node.husb.dict["identifier"] + " -> " + node.dict["identifier"] + " [dir=none];\n"
        stream += from_husb
      }
      for (var j in node.child_list) {
        var child = node.child_list[j]
        var to_child = node.dict["identifier"] + " -> " + child.dict["identifier"] + " [dir=none];\n"
        stream += to_child
      }
    }
    return stream
  }

  store(subgraph, config) {
    var stream = ""
    stream += "digraph\n"
    stream += "{\n"
    stream += "splines = ortho;\n"
    stream += "\n"

    this.subgraph = subgraph
    this.config = config
    stream = this.store_individual_nodes(stream)
    stream = this.store_family_nodes(stream)
    stream = this.store_edges(stream)

    stream += "}\n"

    return stream
  }
}

class GedcomImport {
  constructor() {
    this.individual = null
    this.family = null
    this.graph = []
    this.in_birt = false
    this.in_deat = false
    this.in_marr = false
  }

  reset_flags() {
    if (this.in_birt) {
      this.in_birt = false
    } else if (this.in_deat) {
      this.in_deat = false
    } else if (this.in_marr) {
      this.in_marr = false
    }
  }

  handle_level0(line) {
    if (this.individual) {
      this.graph.push(this.individual)
      this.individual = null
    }
    if (this.family) {
      this.graph.push(this.family)
      this.family = null
    }

    if (line.startsWith("@") && line.endsWith("INDI")) {
      this.individual = new Individual()
      this.individual.dict["identifier"] = line.slice(1,-6)
    } else if (line.startsWith("@") && line.endsWith("FAM")) {
      this.family = new Family()
      this.family.dict["identifier"] = line.slice(1,-5)
    }
  }

  handle_level1(line) {
    this.reset_flags()

    var line_lead_token = line.split(' ')[0]

    if (line_lead_token === "SEX" && this.individual) {
      var tokens = line.split(' ')
      if (tokens.length > 1) {
        this.individual.dict["sex"] = tokens[1]
      }
    } else if (line_lead_token === "HOST" && this.individual) {
      this.individual.dict["hostname"] = line.slice(5).trim()
    } else if (line_lead_token === "NAME" && this.individual) {
      var subline = line.slice(5)
      var subline_tokens = subline.split('/')
      this.individual.dict["forename"] = subline_tokens[0].trim()
      if (subline_tokens.length > 1) {
        this.individual.dict["surname"] = subline_tokens[1].trim()
      }
    } else if (line_lead_token === "FAMC" && this.individual) {
      if (!this.individual.dict["famc_id"]) {
        this.individual.dict["famc_id"] = line.slice(6,-1)
      }
    } else if (line_lead_token === "FAMS" && this.individual) {
      this.individual.fams_ids.push(line.slice(6,-1))
    } else if (line_lead_token === "HUSB" && this.family) {
      this.family.dict["husb_id"] = line.slice(6,-1)
    } else if (line_lead_token === "WIFE" && this.family) {
      this.family.dict["wife_id"] = line.slice(6,-1)
    } else if (line_lead_token === "CHIL" && this.family) {
      this.family.child_ids.push(line.slice(6,-1))
    } else if (line_lead_token === "MARR" && this.family) {
      this.in_marr = true
    } else {
      this.handle_individual_config(line)
    }
  }

  handle_individual_config(line) {
    var line_lead_token = line.split(' ')[0]

    if (line_lead_token === "BIRT") {
      this.in_birt = true
    } else if (line_lead_token === "DEAT") {
      this.in_deat = true
    } else if (line_lead_token === "NOTE" && this.individual) {
      this.individual.config["note"] = line.slice(5)
    }
  }

  load(config) {
    var graph = this.tokenize(config.input)
    for (var i in graph) {
      var node = graph[i]
      node.resolve(graph)
    }
    return graph
  }

  tokenize(stream) {
    var lines = stream.split('\n')
    for (var i in lines) {
      var line = lines[i]
      var tokens = line.split(' ')
      var first_token = tokens[0]
      var level = parseInt(first_token)
      var rest = tokens.slice(1).join(' ')
      if (level === 0) {
        this.handle_level0(rest)
      } else if (level === 1) {
        this.handle_level1(rest)
      } else if (level === 2) {
        if (rest.startsWith("DATE")) {
          var date_tokens = rest.split(' ')
          var year = date_tokens[date_tokens.length - 1]
          if (this.individual) {
            if (this.in_birt) {
              this.individual.config["birth"] = year
            } else if (this.in_deat) {
              this.individual.config["death"] = year
            }
          } else if (this.family && this.in_marr) {
            this.family.dict["marr"] = year
          }
        }
      }
    }
    return this.graph
  }
}

class Individual {
  constructor() {
    this.dict = {}
    this.dict["identifier"] = ""
    this.dict["famc_id"] = ""
    this.dict["forename"] = ""
    this.dict["surname"] = ""
    this.dict["hostname"] = ""
    this.dict["sex"] = ""
    this.famc = ""
    this.fams_ids = []
    this.fams_list = []
    this.depth = 0
    this.config = {}
    this.config["note"] = ""
    this.config["birth"] = ""
    this.config["death"] = ""
  }

  resolve(graph) {
    this.famc = graph_find(graph, this.dict["famc_id"])
    for (var i in this.fams_ids) {
      var fams_id = this.fams_ids[i]
      var fams = graph_find(graph, fams_id)
      this.fams_list.push(fams)
    }
  }

  get_neighbours() {
    var ret = []
    if (this.famc) {
      ret.push(this.famc)
    }
    ret = ret.concat(this.fams_list)
    return ret
  }

  get_label(name_order) {
    var label = "<table border=\"0\" cellborder=\"0\"><tr><td>"
    label +=  "</td></tr><tr><td href=\"q?hostname=" + this.dict["hostname"] + "\"><font face=\"Times\">"
    if (name_order === "big") {
      label += this.dict["surname"] + "<br/>"
      label += this.dict["forename"] + "<br/>"
    } else {
      label += this.dict["forename"] + "<br/>"
      label += this.dict["surname"] + "<br/>"
    }
    if (this.config["birth"] && this.config["death"]) {
      label += this.config["birth"] + "-"
    } else if (!this.config["birth"] && this.config["death"]) {
      label += "† " + this.config["death"]
    } else {
      label += this.config["birth"] + "-" + this.config["death"]
    }
    label += "</font></td></tr></table>"
    return label
  }

  get_color() {
    var sex
    if (!this.dict["sex"]) {
      sex = 'U'
    } else {
      sex = this.dict["sex"].toUpperCase()
    }
    var colormap = {"M": "blue", "F": "pink", "U": "black"}
    var color = colormap[sex]
    return color
  }
}

class Family {
  constructor() {
    this.dict = {}
    this.dict["identifier"] = ""
    this.dict["marr"] = ""
    this.dict["wife_id"] = ""
    this.dict["husb_id"] = ""
    this.wife = null
    this.husb = null
    this.child_ids = []
    this.child_list = []
    this.depth = 0
  }

  resolve(graph) {
    this.wife = graph_find(graph, this.dict["wife_id"])
    this.husb = graph_find(graph, this.dict["husb_id"])
    for (var i in this.child_ids) {
      var child_id = this.child_ids[i]
      var child = graph_find(graph, child_id)
      this.child_list.push(child)
    }
  }

  get_neighbours() {
    var ret = []
    if (this.wife) {
      ret.push(this.wife)
    }
    if (this.husb) {
      ret.push(this.husb)
    }
    ret = ret.concat(this.child_list)
    return ret
  }
}

function graph_find(graph, identifier) {
  if (!identifier) {
    return null
  }
  var results = []
  for (var i in graph) {
    var node = graph[i]
    if (node.dict["identifier"] === identifier) {
      results.push(node)
    }
  }
  if (results.length > 1) {
    return null
  }
  return results[0]
}

function graph_find_(graph) {
  for (var i in graph) {
    var node = graph[i]
    var reg = new RegExp("F")
    if (reg.test(node.dict["identifier"])) {
      return node
    }
  }
}

function bfs_(root, config) {
  var visited = [root]
  var queue = [root]
  var ret = []

  while (queue.length > 0) {
    var node = queue.shift()
    ret.push(node)
    var neighbours = node.get_neighbours()
    for (var i in neighbours) {
      var neighbour = neighbours[i]
      if (!visited.includes(neighbour)) {
        neighbour.depth = node.depth + 1
        visited.push(neighbour)
        queue.push(neighbour)
      }
    }
  }
  return ret
}

function bfs(root, config) {
  var visited = [root]
  var queue = [root]
  var ret = []

  while (queue.length > 0) {
    var node = queue.shift()
    var family_depth = config.familydepth
    if (node.depth > (family_depth * 2 + 1)) {
      return ret
    }
    ret.push(node)
    var neighbours = node.get_neighbours()
    for (var i in neighbours) {
      var neighbour = neighbours[i]
      if (!visited.includes(neighbour)) {
        neighbour.depth = node.depth + 1
        visited.push(neighbour)
        queue.push(neighbour)
      }
    }
  }
  return ret
}

export function ged2dot_(ged) {

  var config = new Config()
  config.input = ged
  var importer = new GedcomImport()
  var graph = importer.load(config)
  var root_family = graph_find_(graph)
  var subgraph = bfs_(root_family, config)
  var exporter = new DotExport()

  return exporter.store(subgraph, config)
}

export function ged2dot(ged, rootfamily, familydepth) {

  var config = new Config()
  config.input = ged
  config.rootfamily = rootfamily
  config.familydepth = familydepth
  var importer = new GedcomImport()
  var graph = importer.load(config)
  var root_family = graph_find(graph, rootfamily)
  var subgraph = bfs(root_family, config)
  var exporter = new DotExport()

  return exporter.store(subgraph, config)
}
