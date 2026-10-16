package com.assessmentportal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationStatusHistory {
    private String timestamp;
    private String changedBy;
    private String fromStatus;
    private String toStatus;
    private String remarks;
}
