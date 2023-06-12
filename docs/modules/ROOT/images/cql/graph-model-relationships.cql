CREATE (id:`State` {
    name: "id"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "id"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (labels:`State` {
    name: "labels"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "labels"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (propertyList:`State` {
    name: "propertyList"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "propertyList"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (propertyMap:`State` {
    name: "propertyMap"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "propertyMap"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (isNode:`FixedState` {
    name: "isNode"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "isNode"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (isRelationship:`FixedState` {
    name: "isRelationship"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "isRelationship"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (radius:`VisualState` {
    name: "radius"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "radius"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (caption:`VisualState` {
    name: "caption"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "caption"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (selected:`VisualState` {
    name: "selected"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "selected"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (expanded:`VisualState` {
    name: "expanded"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "expanded"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (minified:`VisualState` {
    name: "minified"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "minified"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (contextMenu:`VisualState` {
    name: "contextMenu"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "contextMenu"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (x:`VisualState` {
    name: "x"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "x"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (y:`VisualState` {
    name: "y"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "y"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (fx:`VisualState` {
    name: "fixed x"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "fixed x"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (fx:`VisualState` {
    name: "fixed y"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "fixed y"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (hoverFixed:`VisualState` {
    name: "hoverFixed"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "hoverFixed"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (initialPositionCalculated:`VisualState` {
    name: "initialPositionCalculated"
});
MATCH (source), (target)
WHERE source.name = "NodeModel" AND target.name = "initialPositionCalculated"
CREATE (source)-[r:`state`]->(target) RETURN type(r);













MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "id"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "propertyList"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "propertyMap"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "NodeModel"
CREATE (source)-[r:`source`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "NodeModel"
CREATE (source)-[r:`target`]->(target) RETURN type(r);

CREATE (type:`State` {
    name: "type"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "type"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "isNode"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "isRelationship"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (naturalAngle:`VisualState` {
    name: "naturalAngle"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "naturalAngle"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "caption"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (captionLength:`VisualState` {
    name: "captionLength"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "captionLength"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (captionHeight:`VisualState` {
    name: "captionHeight"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "captionHeight"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "RelationshipCaptionLayout"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (shortCaption:`VisualState` {
    name: "shortCaption"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "shortCaption"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (shortCaptionLength:`VisualState` {
    name: "shortCaptionLength"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "shortCaptionLength"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "selected"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (centreDistance:`VisualState` {
    name: "centreDistance"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "centreDistance"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

CREATE (arrow:`VisualState` {
    name: "arrow"
});
MATCH (source), (target)
WHERE source.name = "RelationshipModel" AND target.name = "arrow"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "arrow" AND target.name = "ArcArrow"
CREATE (source)-[r:`sub-type`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "arrow" AND target.name = "LoopArrow"
CREATE (source)-[r:`sub-type`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "arrow" AND target.name = "StraightArrow"
CREATE (source)-[r:`sub-type`]->(target) RETURN type(r);










MATCH (source), (target)
WHERE source.name = "GraphModel" AND target.name = "NodeModel"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "GraphModel" AND target.name = "RelationshipModel"
CREATE (source)-[r:`state`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "GraphModel" AND target.name = "NodeModel"
CREATE (source)-[r:`expandedNodeMap`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "GraphModel" AND target.name = "NodeModel"
CREATE (source)-[r:`nodeMap`]->(target) RETURN type(r);

MATCH (source), (target)
WHERE source.name = "GraphModel" AND target.name = "RelationshipModel"
CREATE (source)-[r:`relationshipMap`]->(target) RETURN type(r);
