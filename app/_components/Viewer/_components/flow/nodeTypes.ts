import { EntityNode } from "./nodes/EntityNode";
import { WeakEntityNode } from "./nodes/WeakEntityNode";
import { RelationshipNode } from "./nodes/RelationshipNode";
import { IdentifyingRelNode } from "./nodes/IdentifyingRelNode";
import { AttributeNode } from "./nodes/AttributeNode";
import { KeyAttributeNode } from "./nodes/KeyAttributeNode";
import { MultivaluedAttrNode } from "./nodes/MultivaluedAttrNode";
import { TextNode } from "./nodes/TextNode";
import { FlowchartShapeNode } from "./nodes/FlowchartShapeNode";

export const chenNodeTypes = {
  // Original Chen ERD
  entity: EntityNode,
  weakEntity: WeakEntityNode,
  relationship: RelationshipNode,
  identifyingRelationship: IdentifyingRelNode,
  attribute: AttributeNode,
  keyAttribute: KeyAttributeNode,
  multivaluedAttribute: MultivaluedAttrNode,
  text: TextNode,

  // Flowchart Shapes from User Image
  terminator: FlowchartShapeNode,
  process: FlowchartShapeNode,
  decision: FlowchartShapeNode,
  delay: FlowchartShapeNode,
  data: FlowchartShapeNode,
  document: FlowchartShapeNode,
  multidocument: FlowchartShapeNode,
  subroutine: FlowchartShapeNode,
  preparation: FlowchartShapeNode,
  display: FlowchartShapeNode,
  manualInput: FlowchartShapeNode,
  manualLoop: FlowchartShapeNode,
  loopLimit: FlowchartShapeNode,
  storedData: FlowchartShapeNode,
  connector: FlowchartShapeNode,
  offpageDown: FlowchartShapeNode,
  offpageUp: FlowchartShapeNode,
  offpageRight: FlowchartShapeNode,
  offpageLeft: FlowchartShapeNode,
  or: FlowchartShapeNode,
  summingJunction: FlowchartShapeNode,
  collate: FlowchartShapeNode,
  sort: FlowchartShapeNode,
  merge: FlowchartShapeNode,
  database: FlowchartShapeNode,
  internalStorage: FlowchartShapeNode,
};
