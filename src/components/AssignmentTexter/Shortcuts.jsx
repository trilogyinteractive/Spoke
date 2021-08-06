import React from "react";
import type from "prop-types";

import Button from "@material-ui/core/Button";

export class Shortcuts extends React.Component {
  render() {
    const {
      campaign,
      cannedResponseScript,
      currentInteractionStep,
      questionResponses
    } = this.props;

    let joinedLength = 0;
    let currentQuestion = null;
    let currentQuestionOptions = [];
    // 1. Current Interaction Step Shortcuts
    const currentStepHasAnswerOptions =
      currentInteractionStep &&
      currentInteractionStep.question &&
      currentInteractionStep.question.answerOptions &&
      currentInteractionStep.question.answerOptions.length;
    if (currentStepHasAnswerOptions) {
      currentQuestion = currentInteractionStep.question;
      const dupeTester = {};
      const shortener = answerValue => {
        // label is for one-word values or e.g. "Yes: ...."
        const label = answerValue.match(/^(\w+)([^\s\w]|$)/);
        return label ? label[1] : answerValue;
      };
      currentQuestionOptions = currentQuestion.answerOptions
        .filter(answer => answer.value[0] !== "-")
        .map(answer => {
          const label = shortener(answer.value);
          if (label in dupeTester) {
            dupeTester.FAIL = true;
          } else {
            dupeTester[label] = 1;
          }
          return {
            answer,
            label
          };
        });
      joinedLength = currentQuestionOptions.map(o => o.label).join("__").length;
      if (joinedLength > 36 || dupeTester.FAIL) {
        // too many/long options or duplicates
        currentQuestionOptions = [];
        joinedLength = 0;
      }
    }
    // 2. Canned Response Shortcuts
    let shortCannedResponses = [];
    // If there's a current interaction step but we aren't showing choices
    // then don't show canned response shortcuts either or it can
    // cause confusion.
    if (!currentStepHasAnswerOptions || joinedLength !== 0) {
      shortCannedResponses = campaign.cannedResponses
        .filter(
          // allow for "Wrong Number", prefixes of + or - can force add or remove
          script =>
            (script.title.length < 13 || script.title[0] === "+") &&
            script.title[0] !== "-"
        )
        .filter(script => {
          if (joinedLength + 1 + script.title.length < 80) {
            joinedLength += 1 + script.title.length;
            return true;
          }
          return false;
        });
    }

    if (!joinedLength) {
      return null;
    }
    // the only non-contextual state/props needed
    // questionResponses, currentInteractionStep, cannedResponseScript
    const isCurrentAnswer = opt =>
      opt.answer.value === questionResponses[currentInteractionStep.id];
    const isCurrentCannedResponse = script =>
      cannedResponseScript && script.id === cannedResponseScript.id;
    return (
      <div>
        {currentQuestionOptions.map(opt => (
          <Button
            key={`shortcutStep_${opt.answer.value}`}
            onClick={() => {
              this.props.onQuestionResponseChange({
                interactionStep: currentInteractionStep,
                questionResponseValue: isCurrentAnswer(opt)
                  ? null
                  : opt.answer.value,
                nextScript:
                  (!isCurrentAnswer(opt) &&
                    opt.answer.nextInteractionStep &&
                    opt.answer.nextInteractionStep.script) ||
                  null
              });
            }}
            style={{
              marginRight: "9px",
              backgroundColor: isCurrentAnswer(opt) ? "#727272" : "white",
              color: isCurrentAnswer(opt) ? "white" : "#494949"
            }}
            variant="outlined"
          >
            {opt.label}
          </Button>
        ))}
        {shortCannedResponses.map(script => (
          <Button
            key={`shortcutScript_${script.id}`}
            onClick={() => {
              this.props.onCannedResponseChange(script);
            }}
            style={{
              marginLeft: "9px",
              color: isCurrentCannedResponse(script) ? "white" : "#494949",
              backgroundColor: isCurrentCannedResponse(script)
                ? "#727272"
                : "white"
            }}
            variant="outlined"
          >
            {script.title.replace(/^(\+|\-)/, "")}
          </Button>
        ))}
      </div>
    );
  }
}

Shortcuts.propTypes = {
  campaign: type.object,
  cannedResponseScript: type.object,
  currentInteractionStep: type.object,
  questionResponses: type.object,
  onCannedResponseChange: type.func,
  onQuestionResponseChange: type.func
};

export default Shortcuts;