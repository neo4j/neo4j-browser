MATCH (n) DETACH DELETE n;

CREATE (NodeModel:`Type` {
    name: "NodeModel"
});
CREATE (RelationshipModel:`Type` {
    name: "RelationshipModel"
});
CREATE (GraphModel:`Type` {
    name: "GraphModel"
});

CREATE (RelationshipCaptionLayout:`Type` {
    name: "RelationshipCaptionLayout"
});

CREATE (StraightArrow:`Type` {
    name: "StraightArrow"
});

CREATE (LoopArrow:`Type` {
    name: "LoopArrow"
});
CREATE (ArcArrow:`Type` {
    name: "ArcArrow"
});