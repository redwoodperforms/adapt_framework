define([
    'coreJS/adapt',
    'coreViews/questionView',
    './adapt-inlineFeedbackQuestionView'
], function (Adapt, QuestionView, InlineFeedbackQuestionView) {

    var QuestionViewInitialize = QuestionView.prototype.initialize;

    QuestionView.prototype.initialize = function (options) {
        var assessmentQuestionFbOnPass = this.model.get('_isPartOfAssessment') && Adapt.course.get("_assessmentQuestionsFeedbackOnSubmit")
            && Adapt.course.get("_assessmentQuestionsFeedbackOnSubmit")._isEnabled;

        if (this.model.get('_canShowFeedback') || assessmentQuestionFbOnPass) {
            _.extend(this, InlineFeedbackQuestionView);
        }

        return QuestionViewInitialize.apply(this, arguments);
    };
});