import React, { useState } from "react";
import { Button, Icon, Tag, Tooltip, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import PropTypes from "prop-types";
// import { useHotkeys } from "react-hotkeys-hook";

import "./AnnotationForm.sass";
import TokenAnnotator from "./annotator/TokenAnnotator";

const AnnotationForm = ({
  pages,
  onAnnotationsChange, handleAccept, handleReject, handleUndo, handleSkip, handleBrowse,
  labelClasses,
  status,
  canAnnotate,
}) => {
  const [activeLabelClass, setActiveLabelClass] = useState(labelClasses.length > 0 ? labelClasses[0]: 'No labels available');

  const navButtons = false;
  const [selectedPage, setSelectedPage] = useState(-1);
  const [selectedStart, setSelectedStart] = useState(-1);
  const [selectedEnd, setSelectedEnd] = useState(-1);

  function onAnnotationRemove(pageIndex, mark) {
    // Remove items in annotations of current paragraph
    if(pages[pageIndex].annotations) {
      const pageAnnotations = pages[pageIndex].annotations.filter(
          (item) => item.start !== mark.start || item.end !== mark.end
      );

      // Is removed annotation the selected one?
      if (
          selectedPage === pageIndex &&
          selectedStart === mark.start &&
          selectedEnd === mark.end
      ) {
        selectPreviousAnnotation(
            pages,
            selectedPage,
            selectedStart,
            selectedEnd
        );
      }

      onAnnotationsChange(pageIndex, pageAnnotations);
    } else {
      onAnnotationsChange(pageIndex, []);
    }

  }

  function onAnnotationClick(pageIndex, mark) {
    // Select clicked annotation
    if (
      pageIndex === selectedPage &&
      selectedStart === mark.start &&
      selectedEnd === mark.end
    ) {
      // Clicked annotation is already selected => deselect
      setSelectedPage(-1);
      setSelectedStart(-1);
      setSelectedEnd(-1);
    } else {
      setSelectedPage(pageIndex);
      setSelectedStart(mark.start);
      setSelectedEnd(mark.end);
    }
  }

  const selectPreviousAnnotation = (
    inputPages,
    page,
    start,
    end
  ) => {
    console.log(
      "selectPreviousAnnotation ",
      pages,
      page,
      start,
      end
    );

    // Page must be set
    if (page >= 0) {
      if (inputPages[page].annotations.length < 1) {
        // Unset
        setSelectedPage(-1);
        setSelectedStart(-1);
        setSelectedEnd(-1);
      }

      // sort annotations in current paragraph descending
      inputPages[page].annotations.sort((a, b) => b.start - a.start);

      // select the annotation with start < selectedStart
      let newSelection;

      for (let i = 0; i < inputPages[page].annotations.length; i += 1) {
        if (inputPages[page].annotations[i].start < start) {
          newSelection = inputPages[page].annotations[i];
          break;
        }
      }

      if (newSelection) {
        // previous annotation found in current paragraph
        setSelectedStart(newSelection.start);
        setSelectedEnd(newSelection.end);
      } else if (page > 0) {
        // Last annotations from previous paragraph
        let newPage = page - 1;

        while (newPage >= 0) {
          if (inputPages[newPage].annotations.length > 0) {
            inputPages[newPage].annotations.sort((a, b) => b.start - a.start); // sort descending

            setSelectedPage(newPage);
            setSelectedStart(inputPages[newPage].annotations[0].start);
            setSelectedEnd(inputPages[newPage].annotations[0].end);
            break;
          }
          newPage -= 1;
        }
      }
    }

    return false;
  };

  const selectNextAnnotation = (inputPages, page, start, end) => {
    console.log(
      "selectNextAnnotation ",
      inputPages,
      page,
      start,
      end
    );

    if (page >= 0) {
      // sort annotations of current paragraph by "start"
      inputPages[page].annotations.sort((a, b) => a.start - b.start);

      // select the annotation with start > selectedEnd
      let newSelection;

      for (let i = 0; i < inputPages[page].annotations.length; i += 1) {
        if (inputPages[page].annotations[i].start > end) {
          newSelection = inputPages[page].annotations[i];
          break;
        }
      }

      if (newSelection) {
        // new selection already found
        setSelectedStart(newSelection.start);
        setSelectedEnd(newSelection.end);
      } else {
        // find in next paragraph
        let newPage = page + 1;

        while (newPage < inputPages.length) {
          // Skip empty paragraphs
          if (inputPages[newPage].annotations.length > 0) {
            inputPages[newPage].annotations.sort((a, b) => a.start - b.start);

            // Take first annotation of next paragraph
            setSelectedPage(newPage);
            setSelectedStart(inputPages[newPage].annotations[0].start);
            setSelectedEnd(inputPages[newPage].annotations[0].end);

            break;
          }
          newPage += 1;
        }
      }
    }
    // TODO jump to beginning?

    return false;
  };

  const selectLabelClass = (
    labelClassIndex,
    labelClass,
    inputPages,
    page,
    start,
    end
  ) => {
    console.log(
      "selectLabelClass (page,start,end)",
      JSON.stringify([page, start, end])
    );

    // Is the selected label class valid?
    if (!isNaN(labelClassIndex) && labelClassIndex > 0 && labelClassIndex <= labelClasses.length) {
      const newActiveLabelClass = labelClasses[labelClassIndex - 1];

      // Is any annotation selected that we need to change?
      if (page >= 0 && start >= 0 && end >= 0) {
        const changedPages = [...inputPages];

        for (let i = 0; i < changedPages[page].annotations.length; i += 1) {
          if (
              start === changedPages[page].annotations[i].start &&
              end === changedPages[page].annotations[i].end
          ) {
            // Change label class
            changedPages[page].annotations[i].label = newActiveLabelClass;
            break;
          }
        }

        // Send annotation change
        console.log("Send annotation change ");
        onAnnotationsChange(page, changedPages[page].annotations);
      }

      // If old label class is equal to new label class, no need to change anything
      // if (labelClass === newActiveLabelClass) return;

      // Update active label class
      setActiveLabelClass(newActiveLabelClass);
    }
  };

  // Hot keys
  // useHotkeys(
  //   "left",
  //   () =>
  //     selectPreviousAnnotation(
  //       annotations,
  //       selectedParagraph,
  //       selectedStart,
  //       selectedEnd
  //     ),
  //   { keydown: false, keyup: true },
  //   [annotations, selectedParagraph, selectedStart, selectedEnd]
  // );
  // useHotkeys(
  //   "right",
  //   () =>
  //     selectNextAnnotation(
  //       annotations,
  //       selectedParagraph,
  //       selectedStart,
  //       selectedEnd
  //     ),
  //   { keydown: false, keyup: true },
  //   [annotations, selectedParagraph, selectedStart, selectedEnd]
  // );
  // useHotkeys(
  //   "0,1,2,3,4,5,6,7,8,9",
  //   (event) =>
  //     selectTag(
  //       parseInt(event.key, 10),
  //       activeTag,
  //       annotations,
  //       selectedParagraph,
  //       selectedStart,
  //       selectedEnd
  //     ),
  //   { keydown: false, keyup: true },
  //   [activeTag, annotations, selectedParagraph, selectedStart, selectedEnd]
  // );

  console.log("Selected: ", [selectedPage, selectedStart, selectedEnd]);

  return (
    <div className="annotation-wrapper">
      <div className="annotation-header">
        <div className="annotation-actions">
          <Tooltip content="Shortcut: a" position={Position.BOTTOM}>
            <Button
                icon="tick"
                intent="success"
                active={status === 'accepted'}
                text="Accept"
                onClick={(e) => handleAccept(e)}
                disabled={!canAnnotate}
            />
          </Tooltip>
          <Tooltip content="Shortcut: x" position={Position.BOTTOM}>
            <Button
                icon="cross"
                intent="danger"
                active={status === 'rejected'}
                text="Reject"
                onClick={(e) => handleReject(e)}
                disabled={!canAnnotate}
            />
          </Tooltip>
          <Tooltip content="Shortcut: space" position={Position.BOTTOM}>
            <Button
                icon="disable"
                text="Ignore"
                active={status === 'skipped'}
                onClick={(e) => handleSkip(e)}
                disabled={!canAnnotate}
            />
          </Tooltip>
          <Tooltip content="Shortcut: backspace/del" position={Position.BOTTOM}>
            <Button
                icon="undo"
                text="Undo"
                onClick={(e) => handleUndo(e)}
                disabled={!canAnnotate}
            />
          </Tooltip>
          <Button
              icon="undo"
              text="Browse collection"
              onClick={(e) => handleBrowse(e)}
          />

        </div>
        <div className="annotation-label-classes">
          {labelClasses.map((labelClass, index) => (
              <Tooltip
                  content={labelClass.toLowerCase()}
                  hoverOpenDelay={1}
                  key={labelClass}
              >
                <Button
                    className={`tag tag-${String(index + 1)} ${
                        labelClasses.length >= 10 ? "" : "tag-colored"
                    }`}
                    active={activeLabelClass === labelClass}
                    onClick={() =>
                        selectLabelClass(
                            index + 1,
                            activeLabelClass,
                            pages,
                            selectedPage,
                            selectedStart,
                            selectedEnd
                        )
                    }
                    disabled={!canAnnotate}
                >
                  {labelClass}
                  <Tag>{index + 1}</Tag>
                </Button>
              </Tooltip>
          ))}
        </div>
        {navButtons && (
          <div className="annotation-navigation">
            <Tooltip
              content="Previous annotation"
              hoverOpenDelay={1}
            >
              <Button
                className="tag"
                onClick={() =>
                  selectPreviousAnnotation(
                    pages,
                    selectedPage,
                    selectedStart,
                    selectedEnd
                  )
                }
                disabled={!canAnnotate}
              >
                <Icon icon={IconNames.ARROW_LEFT} />
              </Button>
            </Tooltip>
            <Tooltip
              content="Next annotation"
              hoverOpenDelay={1}
            >
              <Button
                className="tag"
                onClick={() =>
                  selectNextAnnotation(
                    pages,
                    selectedPage,
                    selectedStart,
                    selectedEnd
                  )
                }
                disabled={!canAnnotate}
              >
                <Icon icon={IconNames.ARROW_RIGHT} />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="annotation-body">
        {pages.map((page, pageIndex) => (
          <div key={`page_${pageIndex + 1}`}>
            <TokenAnnotator
              tokens={page.tokens}
              value={
                page.annotations
              }
              onChange={(changedPageAnnotations) => {
                onAnnotationsChange(
                  pageIndex,
                  changedPageAnnotations
                );
              }}
              getSpan={(span) => ({
                ...span,
                label: activeLabelClass,
              })}
              renderMark={(mark) => (
                <Tag
                  className={`annotation-mark tag-${
                    labelClasses.indexOf(mark.label) + 1
                  } ${
                    pageIndex === selectedPage &&
                    mark.start === selectedStart &&
                    mark.end === selectedEnd
                      ? "annotation-mark annotation-selected"
                      : ""
                  } ${
                    labelClasses.length >= 10 ? "" : "tag-colored"
                  }`}
                  key={mark.key}
                >
                  <div
                    role="button"
                    tabIndex={mark.key}
                    className="tag-content"
                    onClick={() => onAnnotationClick(pageIndex, mark)}
                    onKeyPress={() => onAnnotationClick(pageIndex, mark)}
                  >
                    {mark.text}
                    <span className="tag">{mark.label}</span>
                  </div>
                  <span
                    role="button"
                    tabIndex={mark.key}
                    className="remove"
                    onClick={() => onAnnotationRemove(pageIndex, mark)}
                    onKeyPress={() => onAnnotationClick(pageIndex, mark)}
                  >
                    <Icon icon={IconNames.SMALL_CROSS} />
                  </span>
                </Tag>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

AnnotationForm.propTypes = {
  pages: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAnnotationsChange: PropTypes.func.isRequired,
  handleAccept: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired,
  handleSkip: PropTypes.func.isRequired,
  handleUndo: PropTypes.func.isRequired,
  handleBrowse: PropTypes.func.isRequired,
  labelClasses: PropTypes.arrayOf(PropTypes.string).isRequired,
  status: PropTypes.string,
  canAnnotate: PropTypes.bool,
};

export default AnnotationForm;
