import React, { useState, useEffect, useRef } from "react";
import FamilyTree from "@balkangraph/familytree.js";

export function FamilyTreePageTest() {
  const treeContainerRef = useRef(null);
  const [individuals, setIndividuals] = useState([]);

  useEffect(() => {
    FamilyTree.templates.john.field_0 =
      '<text ' + FamilyTree.attr.width + ' ="230" style="font-size: 16px;font-weight:bold;" fill="#aeaeae" x="60" y="135" text-anchor="middle">{val}</text>';

    FamilyTree.templates.john.field_1 =
      '<text ' + FamilyTree.attr.width + ' ="150" style="font-size: 13px;" fill="#aeaeae" x="60" y="150" text-anchor="middle">{val}</text>';

    FamilyTree.templates.john.img_0 =
      '<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="6" y="6" width="108" height="108" style="border: none; clip-path: url(#rounded_square);"></image>';

    FamilyTree.templates.john_male = Object.assign({}, FamilyTree.templates.john);
    FamilyTree.templates.john_male.node = '';
    FamilyTree.templates.john_male.img_0 =
      '<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="6" y="6" width="108" height="108" style="border: none; clip-path: url(#rounded_square);"></image>';

    FamilyTree.templates.john_female = Object.assign({}, FamilyTree.templates.john);
    FamilyTree.templates.john_female.node = '';
    FamilyTree.templates.john_female.img_0 =
      '<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="6" y="6" width="108" height="108" style="border: none; clip-path: circle(50% at 50% 50%);"></image>';

    FamilyTree.templates.john.defs = `
      <clipPath id="rounded_square">
        <rect x="6" y="6" width="108" height="108" rx="15" ry="15"></rect>
      </clipPath>
    `;

    const familyMembers = [
        { id: 1, pids: [2], name: "Amber Stevens", gender: "female", dob: "1985-05-15", photo: "https://cdn.balkan.app/shared/w60/3.jpg" },
        { id: 2, pids: [1], name: "John Stevens", gender: "male", dob: "1982-03-20", photo: "https://cdn.balkan.app/shared/m60/3.jpg" },
        { id: 3, mid: 1, fid: 2, name: "Peter Stevens", gender: "male", dob: "2010-02-10", photo: "https://cdn.balkan.app/shared/m30/1.jpg" },
        { id: 4, mid: 1, fid: 2, name: "Savin Stevens", gender: "male", dob: "2012-08-22", photo: "https://cdn.balkan.app/shared/m30/2.jpg" },
        { id: 5, mid: 1, fid: 2, name: "Emma Stevens", gender: "female", dob: "2015-11-30", photo: "https://cdn.balkan.app/shared/w30/5.jpg" }
      ];

    setIndividuals(familyMembers);
  }, []);

  useEffect(() => {
    if (individuals.length > 0 && treeContainerRef.current) {
      renderFamilyTree();
    }
  }, [individuals]);

  const renderFamilyTree = () => {
    const nodes = individuals.map((person) => ({
      id: person.id,
      name: person.name,
      gender: person.gender,
      dob: person.dob,
      img: person.photo,
      pids: person.pids || [],
      fid: person.fid || null,
      mid: person.mid || null,
    }));

    const family = new FamilyTree(treeContainerRef.current, {
      mouseScrool: FamilyTree.action.ctrlZoom,
      template: "john",
      nodeBinding: {
        field_0: "name",
        field_1: "dob",
        img_0: "img",
      },
      nodes: nodes,
      layout: FamilyTree.ROUNDED,
      menu: {
        pdf: { text: "Export PDF" },
        json: { text: "Export JSON" },
      },
      mode: "light",
      connectors: {
        type: "step",
        color: "#aeaeae",
        width: 2,
        stroke: "double"
      }
    });

    family.onInit(() => {
      console.log("Family tree initialized with hardcoded data.");
    });
  };

  return (
    <div>
      <h2>Family Tree</h2>
      <div
        ref={treeContainerRef}
        style={{ width: "100vw", height: "600px", backgroundColor: "#f4f4f4" }}
      ></div>
    </div>
  );
}

export default FamilyTreePageTest;
