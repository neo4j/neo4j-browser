/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable */
window.neo = window.neo || {}

neo.queryPlan = function(element) {
    var augment, color, colors, costColor, detailFontSize, display, dividerColor, fixedWidthFont, formatNumber, layout, linkColor, margin, maxChildOperators, maxComparableDbHits, maxComparableRows, maxCostHeight, operatorCategories, operatorColors, operatorCornerRadius, operatorDetailHeight, operatorDetails, operatorHeaderFontSize, operatorHeaderHeight, operatorMargin, operatorPadding, operatorWidth, plural, rankMargin, render, rows, standardFont, transform;
    return maxChildOperators = 2,
    maxComparableRows = 1e6,
    maxComparableDbHits = 1e6,
    operatorWidth = 180,
    operatorCornerRadius = 4,
    operatorHeaderHeight = 18,
    operatorHeaderFontSize = 11,
    operatorDetailHeight = 14,
    maxCostHeight = 50,
    detailFontSize = 10,
    operatorMargin = 50,
    operatorPadding = 3,
    rankMargin = 50,
    margin = 10,
    standardFont = "'Helvetica Neue',Helvetica,Arial,sans-serif",
    fixedWidthFont = "Monaco,'Courier New',Terminal,monospace",
    linkColor = "#DFE1E3",
    costColor = "#F25A29",
    dividerColor = "#DFE1E3",
    operatorColors = ["#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"],
    operatorCategories = {
        result: ["result"],
        seek: ["scan", "seek", "argument"],
        rows: ["limit", "top", "skip", "sort", "union", "projection"],
        other: [],
        filter: ["select", "filter", "apply", "distinct"],
        expand: ["expand", "product", "join", "optional", "path"],
        eager: ["eager"]
    },
    augment = function(color) {
        return {
            color: color,
            "border-color": d3.rgb(color).darker(),
            "text-color-internal": d3.hsl(color).l < .7 ? "#FFFFFF" : "#000000"
        }
    }
    ,
    colors = d3.scale.ordinal().domain(d3.keys(operatorCategories)).range(operatorColors),
    color = function(d) {
        var j, keyword, keywords, len, name;
        for (name in operatorCategories)
            for (keywords = operatorCategories[name],
            j = 0,
            len = keywords.length; len > j; j++)
                if (keyword = keywords[j],
                new RegExp(keyword,"i").test(d))
                    return augment(colors(name));
        return augment(colors("other"))
    }
    ,
    rows = function(operator) {
        var ref, ref1;
        return null != (ref = null != (ref1 = operator.Rows) ? ref1 : operator.EstimatedRows) ? ref : 0
    }
    ,
    plural = function(noun, count) {
        return 1 === count ? noun : noun + "s"
    }
    ,
    formatNumber = d3.format(",.0f"),
    operatorDetails = function(operator) {
        var detail, details, expression, identifiers, index, j, len, ref, ref1, ref2, ref3, ref4, wordWrap, y;
        if (!operator.expanded)
            return [];
        for (details = [],
        wordWrap = function(string, className) {
            var firstWord, lastWord, measure, results, words;
            for (measure = function(text) {
                return neo.measureText(text, fixedWidthFont, 10)
            }
            ,
            words = string.split(/([^a-zA-Z\d])/),
            firstWord = 0,
            lastWord = 1,
            results = []; firstWord < words.length; ) {
                for (; lastWord < words.length && measure(words.slice(firstWord, lastWord + 1).join("")) < operatorWidth - 2 * operatorPadding; )
                    lastWord++;
                details.push({
                    className: className,
                    value: words.slice(firstWord, lastWord).join("")
                }),
                firstWord = lastWord,
                results.push(lastWord = firstWord + 1)
            }
            return results
        }
        ,
        (identifiers = null != (ref = operator.identifiers) ? ref : null != (ref1 = operator.KeyNames) ? ref1.split(", ") : void 0) && (wordWrap(identifiers.filter(function(d) {
            return !/^  /.test(d)
        }).join(", "), "identifiers"),
        details.push({
            className: "padding"
        })),
        (index = operator.Index) && (wordWrap(index, "index"),
        details.push({
            className: "padding"
        })),
        (expression = null != (ref2 = null != (ref3 = null != (ref4 = operator.LegacyExpression) ? ref4 : operator.ExpandExpression) ? ref3 : operator.LabelName) ? ref2 : operator.Signature) && (wordWrap(expression, "expression"),
        details.push({
            className: "padding"
        })),
        null != operator.Rows && null != operator.EstimatedRows && details.push({
            className: "estimated-rows",
            key: "estimated rows",
            value: formatNumber(operator.EstimatedRows)
        }),
        null == operator.DbHits || operator.alwaysShowCost || details.push({
            className: "db-hits",
            key: plural("db hit", operator.DbHits || 0),
            value: formatNumber(operator.DbHits || 0)
        }),
        details.length && "padding" === details[details.length - 1].className && details.pop(),
        y = operatorDetailHeight,
        j = 0,
        len = details.length; len > j; j++)
            detail = details[j],
            detail.y = y,
            y += "padding" === detail.className ? 2 * operatorPadding : operatorDetailHeight;
        return details
    }
    ,
    transform = function(queryPlan) {
        var collectLinks, links, operators, result;
        return operators = [],
        links = [],
        result = {
            operatorType: "Result",
            children: [queryPlan.root]
        },
        collectLinks = function(operator, rank) {
            var child, j, len, ref, results;
            for (operators.push(operator),
            operator.rank = rank,
            ref = operator.children,
            results = [],
            j = 0,
            len = ref.length; len > j; j++)
                child = ref[j],
                child.parent = operator,
                collectLinks(child, rank + 1),
                results.push(links.push({
                    source: child,
                    target: operator
                }));
            return results
        }
        ,
        collectLinks(result, 0),
        [operators, links]
    }
    ,
    layout = function(operators, links) {
        var alpha, center, child, childrenWidth, collide, costHeight, currentY, height, iterations, j, k, l, len, len1, len2, len3, len4, link, linkWidth, m, n, operator, operatorHeight, rank, ranks, ref, ref1, relaxDownwards, relaxUpwards, tx, width;
        for (costHeight = function() {
            var scale;
            return scale = d3.scale.log().domain([1, Math.max(d3.max(operators, function(operator) {
                return operator.DbHits || 0
            }), maxComparableDbHits)]).range([0, maxCostHeight]),
            function(operator) {
                var ref;
                return scale((null != (ref = operator.DbHits) ? ref : 0) + 1)
            }
        }(),
        operatorHeight = function(operator) {
            var height;
            return height = operatorHeaderHeight,
            operator.expanded && (height += operatorDetails(operator).slice(-1)[0].y + 2 * operatorPadding),
            height += costHeight(operator)
        }
        ,
        linkWidth = function() {
            var scale;
            return scale = d3.scale.log().domain([1, Math.max(d3.max(operators, function(operator) {
                return rows(operator) + 1
            }), maxComparableRows)]).range([2, (operatorWidth - 2 * operatorCornerRadius) / maxChildOperators]),
            function(operator) {
                return scale(rows(operator) + 1)
            }
        }(),
        j = 0,
        len = operators.length; len > j; j++)
            for (operator = operators[j],
            operator.height = operatorHeight(operator),
            operator.costHeight = costHeight(operator),
            operator.costHeight > operatorDetailHeight + operatorPadding && (operator.alwaysShowCost = !0),
            childrenWidth = d3.sum(operator.children, linkWidth),
            tx = (operatorWidth - childrenWidth) / 2,
            ref = operator.children,
            k = 0,
            len1 = ref.length; len1 > k; k++)
                child = ref[k],
                child.tx = tx,
                tx += linkWidth(child);
        for (l = 0,
        len2 = links.length; len2 > l; l++)
            link = links[l],
            link.width = linkWidth(link.source);
        for (ranks = d3.nest().key(function(operator) {
            return operator.rank
        }).entries(operators),
        currentY = 0,
        m = 0,
        len3 = ranks.length; len3 > m; m++)
            for (rank = ranks[m],
            currentY -= d3.max(rank.values, operatorHeight) + rankMargin,
            ref1 = rank.values,
            n = 0,
            len4 = ref1.length; len4 > n; n++)
                operator = ref1[n],
                operator.x = 0,
                operator.y = currentY;
        for (width = d3.max(ranks.map(function(rank) {
            return rank.values.length * (operatorWidth + operatorMargin)
        })),
        height = -currentY,
        collide = function() {
            var dx, i, lastOperator, len5, len6, p, q, ref2, results, x0;
            for (results = [],
            p = 0,
            len5 = ranks.length; len5 > p; p++) {
                for (rank = ranks[p],
                x0 = 0,
                ref2 = rank.values,
                q = 0,
                len6 = ref2.length; len6 > q; q++)
                    operator = ref2[q],
                    dx = x0 - operator.x,
                    dx > 0 && (operator.x += dx),
                    x0 = operator.x + operatorWidth + operatorMargin;
                dx = x0 - operatorMargin - width,
                dx > 0 ? (lastOperator = rank.values[rank.values.length - 1],
                x0 = lastOperator.x -= dx,
                results.push(function() {
                    var r, ref3, results1;
                    for (results1 = [],
                    i = r = ref3 = rank.values.length - 2; r >= 0; i = r += -1)
                        operator = rank.values[i],
                        dx = operator.x + operatorWidth + operatorMargin - x0,
                        dx > 0 ? (operator.x -= operatorWidth,
                        results1.push(x0 = operator.x)) : results1.push(void 0);
                    return results1
                }())) : results.push(void 0)
            }
            return results
        }
        ,
        center = function(operator) {
            return operator.x + operatorWidth / 2
        }
        ,
        relaxUpwards = function(alpha) {
            var len5, p, results, x;
            for (results = [],
            p = 0,
            len5 = ranks.length; len5 > p; p++)
                rank = ranks[p],
                results.push(function() {
                    var len6, q, ref2, results1;
                    for (ref2 = rank.values,
                    results1 = [],
                    q = 0,
                    len6 = ref2.length; len6 > q; q++)
                        operator = ref2[q],
                        operator.children.length ? (x = d3.sum(operator.children, function(child) {
                            return linkWidth(child) * center(child)
                        }) / d3.sum(operator.children, linkWidth),
                        results1.push(operator.x += (x - center(operator)) * alpha)) : results1.push(void 0);
                    return results1
                }());
            return results
        }
        ,
        relaxDownwards = function(alpha) {
            var len5, p, ref2, results;
            for (ref2 = ranks.slice().reverse(),
            results = [],
            p = 0,
            len5 = ref2.length; len5 > p; p++)
                rank = ref2[p],
                results.push(function() {
                    var len6, q, ref3, results1;
                    for (ref3 = rank.values,
                    results1 = [],
                    q = 0,
                    len6 = ref3.length; len6 > q; q++)
                        operator = ref3[q],
                        operator.parent ? results1.push(operator.x += (center(operator.parent) - center(operator)) * alpha) : results1.push(void 0);
                    return results1
                }());
            return results
        }
        ,
        collide(),
        iterations = 300,
        alpha = 1; iterations--; )
            relaxUpwards(alpha),
            collide(),
            relaxDownwards(alpha),
            collide(),
            alpha *= .98;
        return width = d3.max(operators, function(o) {
            return o.x
        }) - d3.min(operators, function(o) {
            return o.x
        }) + operatorWidth,
        [width, height]
    }
    ,
    render = function(operators, links, width, height, redisplay) {
        var join, svg;
        return svg = d3.select(element),
        svg.transition().attr("width", width + 2 * margin).attr("height", height + 2 * margin).attr("viewBox", [d3.min(operators, function(o) {
            return o.x
        }) - margin, -margin - height, width + 2 * margin, height + 2 * margin].join(" ")),
        (join = function(parent, children) {
            var child, j, len, ref, results, selection;
            for (ref = d3.entries(children),
            results = [],
            j = 0,
            len = ref.length; len > j; j++)
                child = ref[j],
                selection = parent.selectAll(child.key).data(child.value.data),
                child.value.selections(selection.enter(), selection, selection.exit()),
                child.value.children ? results.push(join(selection, child.value.children)) : results.push(void 0);
            return results
        }
        )(svg, {
            "g.layer.links": {
                data: [links],
                selections: function(enter) {
                    return enter.append("g").attr("class", "layer links")
                },
                children: {
                    ".link": {
                        data: function(d) {
                            return d
                        },
                        selections: function(enter) {
                            return enter.append("g").attr("class", "link")
                        },
                        children: {
                            path: {
                                data: function(d) {
                                    return [d]
                                },
                                selections: function(enter, update) {
                                    return enter.append("path").attr("fill", linkColor),
                                    update.transition().attr("d", function(d) {
                                        var control1, control2, controlWidth, curvature, sourceX, sourceY, targetX, targetY, yi;
                                        return width = Math.max(1, d.width),
                                        sourceX = d.source.x + operatorWidth / 2,
                                        targetX = d.target.x + d.source.tx,
                                        sourceY = d.source.y + d.source.height,
                                        targetY = d.target.y,
                                        yi = d3.interpolateNumber(sourceY, targetY),
                                        curvature = .5,
                                        control1 = yi(curvature),
                                        control2 = yi(1 - curvature),
                                        controlWidth = Math.min(width / Math.PI, (targetY - sourceY) / Math.PI),
                                        sourceX > targetX + width / 2 && (controlWidth *= -1),
                                        ["M", sourceX + width / 2, sourceY, "C", sourceX + width / 2, control1 - controlWidth, targetX + width, control2 - controlWidth, targetX + width, targetY, "L", targetX, targetY, "C", targetX, control2 + controlWidth, sourceX - width / 2, control1 + controlWidth, sourceX - width / 2, sourceY, "Z"].join(" ")
                                    })
                                }
                            },
                            text: {
                                data: function(d) {
                                    var caption, key, ref, source, x, y;
                                    return x = d.source.x + operatorWidth / 2,
                                    y = d.source.y + d.source.height + operatorDetailHeight,
                                    source = d.source,
                                    null != source.Rows || null != source.EstimatedRows ? (ref = null != source.Rows ? ["Rows", "row"] : ["EstimatedRows", "estimated row"],
                                    key = ref[0],
                                    caption = ref[1],
                                    [{
                                        x: x,
                                        y: y,
                                        text: formatNumber(source[key]) + "\xa0",
                                        anchor: "end"
                                    }, {
                                        x: x,
                                        y: y,
                                        text: plural(caption, source[key]),
                                        anchor: "start"
                                    }]) : []
                                },
                                selections: function(enter, update) {
                                    return enter.append("text").attr("font-size", detailFontSize).attr("font-family", standardFont),
                                    update.transition().attr("x", function(d) {
                                        return d.x
                                    }).attr("y", function(d) {
                                        return d.y
                                    }).attr("text-anchor", function(d) {
                                        return d.anchor
                                    }).text(function(d) {
                                        return d.text
                                    })
                                }
                            }
                        }
                    }
                }
            },
            "g.layer.operators": {
                data: [operators],
                selections: function(enter) {
                    return enter.append("g").attr("class", "layer operators")
                },
                children: {
                    ".operator": {
                        data: function(d) {
                            return d
                        },
                        selections: function(enter, update) {
                            return enter.append("g").attr("class", "operator"),
                            update.transition().attr("transform", function(d) {
                                return "translate(" + d.x + "," + d.y + ")"
                            })
                        },
                        children: {
                            "rect.background": {
                                data: function(d) {
                                    return [d]
                                },
                                selections: function(enter, update) {
                                    return enter.append("rect").attr("class", "background"),
                                    update.transition().attr("width", operatorWidth).attr("height", function(d) {
                                        return d.height
                                    }).attr("rx", operatorCornerRadius).attr("ry", operatorCornerRadius).attr("fill", "white").style("stroke", "none")
                                }
                            },
                            "g.header": {
                                data: function(d) {
                                    return [d]
                                },
                                selections: function(enter) {
                                    return enter.append("g").attr("class", "header").attr("pointer-events", "all").on("click", function(d) {
                                        return d.expanded = !d.expanded,
                                        redisplay()
                                    })
                                },
                                children: {
                                    "path.banner": {
                                        data: function(d) {
                                            return [d]
                                        },
                                        selections: function(enter, update) {
                                            return enter.append("path").attr("class", "banner"),
                                            update.attr("d", function(d) {
                                                var shaving;
                                                return shaving = d.height <= operatorHeaderHeight ? operatorCornerRadius : d.height < operatorHeaderHeight + operatorCornerRadius ? operatorCornerRadius - Math.sqrt(Math.pow(operatorCornerRadius, 2) - Math.pow(operatorCornerRadius - d.height + operatorHeaderHeight, 2)) : 0,
                                                ["M", operatorWidth - operatorCornerRadius, 0, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth, operatorCornerRadius, "L", operatorWidth, operatorHeaderHeight - operatorCornerRadius, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - shaving, operatorHeaderHeight, "L", shaving, operatorHeaderHeight, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, 0, operatorHeaderHeight - operatorCornerRadius, "L", 0, operatorCornerRadius, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorCornerRadius, 0, "Z"].join(" ")
                                            }).style("fill", function(d) {
                                                return color(d.operatorType).color
                                            })
                                        }
                                    },
                                    "path.expand": {
                                        data: function(d) {
                                            return "Result" === d.operatorType ? [] : [d]
                                        },
                                        selections: function(enter, update) {
                                            var rotateForExpand;
                                            return rotateForExpand = function(d) {
                                                return d3.transform(),
                                                "translate(" + operatorHeaderHeight / 2 + ", " + operatorHeaderHeight / 2 + ") " + ("rotate(" + (d.expanded ? 90 : 0) + ") ") + "scale(0.5)"
                                            }
                                            ,
                                            enter.append("path").attr("class", "expand").attr("fill", function(d) {
                                                return color(d.operatorType)["text-color-internal"]
                                            }).attr("d", "M -5 -10 L 8.66 0 L -5 10 Z").attr("transform", rotateForExpand),
                                            update.transition().attrTween("transform", function(d, i, a) {
                                                return d3.interpolateString(a, rotateForExpand(d))
                                            })
                                        }
                                    },
                                    "text.title": {
                                        data: function(d) {
                                            return [d]
                                        },
                                        selections: function(enter) {
                                            return enter.append("text").attr("class", "title").attr("font-size", operatorHeaderFontSize).attr("font-family", standardFont).attr("x", operatorHeaderHeight).attr("y", 13).attr("fill", function(d) {
                                                return color(d.operatorType)["text-color-internal"]
                                            }).text(function(d) {
                                                return d.operatorType
                                            })
                                        }
                                    }
                                }
                            },
                            "g.detail": {
                                data: operatorDetails,
                                selections: function(enter, update, exit) {
                                    return enter.append("g"),
                                    update.attr("class", function(d) {
                                        return "detail " + d.className
                                    }).attr("transform", function(d) {
                                        return "translate(0, " + (operatorHeaderHeight + d.y) + ")"
                                    }).attr("font-family", function(d) {
                                        return "expression" === d.className || "identifiers" === d.className ? fixedWidthFont : standardFont
                                    }),
                                    exit.remove()
                                },
                                children: {
                                    text: {
                                        data: function(d) {
                                            return d.key ? [{
                                                text: d.value + "\xa0",
                                                anchor: "end",
                                                x: operatorWidth / 2
                                            }, {
                                                text: d.key,
                                                anchor: "start",
                                                x: operatorWidth / 2
                                            }] : [{
                                                text: d.value,
                                                anchor: "start",
                                                x: operatorPadding
                                            }]
                                        },
                                        selections: function(enter, update, exit) {
                                            return enter.append("text").attr("font-size", detailFontSize),
                                            update.attr("x", function(d) {
                                                return d.x
                                            }).attr("text-anchor", function(d) {
                                                return d.anchor
                                            }).attr("fill", "black").transition().each("end", function() {
                                                return update.text(function(d) {
                                                    return d.text
                                                })
                                            }),
                                            exit.remove()
                                        }
                                    },
                                    "path.divider": {
                                        data: function(d) {
                                            return "padding" === d.className ? [d] : []
                                        },
                                        selections: function(enter, update) {
                                            return enter.append("path").attr("class", "divider").attr("visibility", "hidden"),
                                            update.attr("d", ["M", 0, 2 * -operatorPadding, "L", operatorWidth, 2 * -operatorPadding].join(" ")).attr("stroke", dividerColor).transition().each("end", function() {
                                                return update.attr("visibility", "visible")
                                            })
                                        }
                                    }
                                }
                            },
                            "path.cost": {
                                data: function(d) {
                                    return [d]
                                },
                                selections: function(enter, update) {
                                    return enter.append("path").attr("class", "cost").attr("fill", costColor),
                                    update.transition().attr("d", function(d) {
                                        var shaving;
                                        return d.costHeight < operatorCornerRadius ? (shaving = operatorCornerRadius - Math.sqrt(Math.pow(operatorCornerRadius, 2) - Math.pow(operatorCornerRadius - d.costHeight, 2)),
                                        ["M", operatorWidth - shaving, d.height - d.costHeight, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - operatorCornerRadius, d.height, "L", operatorCornerRadius, d.height, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, shaving, d.height - d.costHeight, "Z"].join(" ")) : ["M", 0, d.height - d.costHeight, "L", operatorWidth, d.height - d.costHeight, "L", operatorWidth, d.height - operatorCornerRadius, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - operatorCornerRadius, d.height, "L", operatorCornerRadius, d.height, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, 0, d.height - operatorCornerRadius, "Z"].join(" ")
                                    })
                                }
                            },
                            "text.cost": {
                                data: function(d) {
                                    var y;
                                    return d.alwaysShowCost ? (y = d.height - d.costHeight + operatorDetailHeight,
                                    [{
                                        text: formatNumber(d.DbHits) + "\xa0",
                                        anchor: "end",
                                        y: y
                                    }, {
                                        text: "db hits",
                                        anchor: "start",
                                        y: y
                                    }]) : []
                                },
                                selections: function(enter, update) {
                                    return enter.append("text").attr("class", "cost").attr("font-size", detailFontSize).attr("font-family", standardFont).attr("fill", "white"),
                                    update.attr("x", operatorWidth / 2).attr("text-anchor", function(d) {
                                        return d.anchor
                                    }).transition().attr("y", function(d) {
                                        return d.y
                                    }).each("end", function() {
                                        return update.text(function(d) {
                                            return d.text
                                        })
                                    })
                                }
                            },
                            "rect.outline": {
                                data: function(d) {
                                    return [d]
                                },
                                selections: function(enter, update) {
                                    return enter.append("rect").attr("class", "outline"),
                                    update.transition().attr("width", operatorWidth).attr("height", function(d) {
                                        return d.height
                                    }).attr("rx", operatorCornerRadius).attr("ry", operatorCornerRadius).attr("fill", "none").attr("stroke-width", 1).style("stroke", function(d) {
                                        return color(d.operatorType)["border-color"]
                                    })
                                }
                            }
                        }
                    }
                }
            }
        })
    }
    ,
    display = function(queryPlan) {
        var height, links, operators, ref, ref1, width;
        return ref = transform(queryPlan),
        operators = ref[0],
        links = ref[1],
        ref1 = layout(operators, links),
        width = ref1[0],
        height = ref1[1],
        render(operators, links, width, height, function() {
            return display(queryPlan)
        })
    }
    ,
    this.display = display,
    this
}
;
neo.measureText = (function() {
  let measureUsingCanvas = function(text, font) {
    let canvasSelection = d3.select('canvas#textMeasurementCanvas').data([this]);
    canvasSelection.enter().append('canvas')
      .attr('id', 'textMeasurementCanvas')
      .style('display', 'none');

    let canvas = canvasSelection.node();
    let context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  };

  let cache = (function() {
    let cacheSize = 10000;
    let map = {};
    let list = [];
    return function(key, calc) {
      let cached = map[key];
      if (cached) {
        return cached;
      } else {
        let result = calc();
        if (list.length > cacheSize) {
          delete map[list.splice(0, 1)];
          list.push(key);
        }
        return map[key] = result;
      }
    };
  })();

  return function(text, fontFamily, fontSize) {
    let font = 'normal normal normal' + fontSize + 'px/normal ' + fontFamily;
    return cache(text + font, function() { measureUsingCanvas(text, font)});
  };
})();
